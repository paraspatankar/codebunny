"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { success } from "zod";
import { deleteWebhook } from "@/module/github/lib/github";

export async function getUserProfile() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("User is not authenticated");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function updateUserProfile(data: {
  name?: string;
  email?: string;
  image?: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("User is not authenticated");
    }

    const updateUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: data.name,
        email: data.email,
        image: data.image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    revalidatePath("/dashboard/settings", "page"); // Revalidate the page

    return {
      success: true,
      user: updateUser,
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      success: false,
      error: "Failed to update user profile",
    };
  }
}

export async function getConnectedRepositories() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("User is not authenticated");
    }

    const repositories = await prisma.repository.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        url: true,

        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return repositories;
  } catch (error) {
    console.error("Error fetching connected repositories:", error);
    return [];
  }
}

export async function disconnectRepository(repositoryId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("User is not authenticated");
    }

    const repository = await prisma.repository.findUnique({
      where: {
        id: repositoryId,
        userId: session.user.id,
      },
    });

    if (!repository) {
      throw new Error("Repository not found");
    }

    const webhookDeleted = await deleteWebhook(
      repository.owner,
      repository.name
    );

    if (!webhookDeleted) {
      console.warn(
        `Failed to delete webhook for ${repository.fullName}, but proceeding with repository deletion`
      );
    }

    await prisma.repository.delete({
      where: {
        id: repositoryId,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/settings", "page");
    revalidatePath("/dashboard/repository", "page");

    return {
      success: true,
      webhookDeleted,
    };
  } catch (error) {
    console.error("Error disconnecting repository:", error);
    return { success: false, error: "Failed to disconnect repository" };
  }
}

export async function disconnectAllRepositories() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("User is not authenticated");
    }

    const repositories = await prisma.repository.findMany({
      where: {
        userId: session.user.id,
      },
    });

    await Promise.all(
      repositories.map(async (repository) => {
        await deleteWebhook(repository.owner, repository.name);
        await prisma.repository.delete({
          where: {
            id: repository.id,
            userId: session.user.id,
          },
        });
      })
    );

    revalidatePath("/dashboard/settings", "page"); // Revalidate the page
    revalidatePath("/dashboard/repository", "page"); // Q.What does RevalidatePath do? Answer: It revalidates the page, forcing a new request to the server to fetch the updated data.

    return { success: true, count: repositories.length };
  } catch (error) {
    console.error("Error disconnecting all repositories:", error);
    return { success: false, error: "Failed to disconnect all repositories" };
  }
}
