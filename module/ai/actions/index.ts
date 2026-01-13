"use server";

import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { getPullRequestDiff } from "@/module/github/lib/github";

/**
 * Queue a review for a GitHub pull request by fetching the PR diff and emitting a review request event.
 *
 * @param owner - GitHub repository owner or organization
 * @param repo - GitHub repository name
 * @param prNumber - Pull request number
 * @returns An object with `success: true` and `message: "Review Queued"` on success; `undefined` if the operation failed and the error was recorded in the database
 */
export async function reviewPullRequest(
  owner: string,
  repo: string,
  prNumber: number
) {
  try {
    const repository = await prisma.repository.findFirst({
      where: {
        owner: owner,
        name: repo,
      },
      include: {
        user: {
          include: {
            accounts: {
              where: {
                providerId: "github",
              },
            },
          },
        },
      },
    });

    if (!repository) {
      throw new Error(
        `Repository ${owner}/${repo} not found in database. Please reconnect the repository.`
      );
    }

    const githubAccount = repository.user.accounts[0];

    if (!githubAccount?.accessToken) {
      throw new Error(
        `No GitHub access token found for ${repository.user.email}. Please reconnect the repository.`
      );
    }

    //   const octokit = new Octokit({ auth: githubAccount.accessToken });

    const token = githubAccount.accessToken;

    const { title } = await getPullRequestDiff(token, owner, repo, prNumber);

    await inngest.send({
      name: "pr.review.requested",
      data: {
        owner,
        repo,
        prNumber,
        userId: repository.userId,
      },
    });

    return { success: true, message: "Review Queued" };
  } catch (error) {
    try {
      const repository = await prisma.repository.findFirst({
        where: { owner, name: repo },
      });

      if (repository) {
        await prisma.review.create({
          data: {
            repositoryId: repository.id,
            prNumber,
            prTitle: "Failed to fetch PR",
            prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
            review: `Error: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            status: "failed",
          },
        });
      }
    } catch (dberror) {
      console.error("Failed to save error to database:", dberror);
    }
  }
}