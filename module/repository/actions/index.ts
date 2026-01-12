"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createWebhook, getRepositories } from "@/module/github/lib/github";
import { bigint, github } from "better-auth";
import { inngest } from "@/inngest/client";

export const fetchRepositories = async (
  page: number = 1,
  per_page: number = 10
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("User is not authenticated");
  }

  const githubRepos = await getRepositories(page, per_page);

  //Fetch repositories stored in our database for the logged-in user
  const dbRepos = await prisma.repository.findMany({
    where: {
      userId: session.user.id,
    },
  });

  const connectedRepoIds = new Set(dbRepos.map((repo) => repo.githubId));

  return githubRepos.map((repo: any) => ({
    ...repo,
    isConnected: connectedRepoIds.has(repo.id),
  }));
};

export const connectRepository = async (
  owner: string,
  repo: string,
  githubId: number
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("User is not authenticated");
  }

  //TODO: CHECK IF USER CAN CONNECT MORE REPO FOR OUR PAYMENT SYSTEM

  const webhook = await createWebhook(owner, repo);

  if (webhook) {
    await prisma.repository.create({
      data: {
        githubId: BigInt(githubId),
        name: repo,
        owner: owner,
        fullName: `${owner}/${repo}`,
        url: `https://github.com/${owner}/${repo}`,
        userId: session.user.id,
      },
    });
  }

  //TODO: INCREMENT REPO COUNT FOR USAGE TRACKING

  //TRIGGER REPOSITORY INDEXING FOR RAG (FIRE AND FORGOT)
  try {
    await inngest.send({
      name: "repository.connected",
      data: {
        owner,
        repo,
        userId: session.user.id,
      },
    });
  } catch (error) {
    console.error("Error sending repository.connected event:", error);
  }

  return webhook;
};
