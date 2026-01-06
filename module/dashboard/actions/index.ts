"use server";

import {
  fetchUserContributions,
  getGithubToken,
} from "@/module/github/lib/github";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Octokit } from "octokit";
import prisma from "@/lib/db";
import { se } from "date-fns/locale";

export async function getDashboardStats() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("User is not authenticated");
    }

    const token = await getGithubToken();
    const octokit = new Octokit({ auth: token });

    // Fetch github username from database
    const { data: user } = await octokit.rest.users.getAuthenticated();

    if (!user.login) {
      throw new Error("GitHub username not found");
    }

    // TODO: FETCH TOTAL CONNECTED REPOSITORIES FROM DB
    const totalRepos = 30; // Placeholder value

    const calendar = await fetchUserContributions(token, user.login);
    const totalCommits = calendar?.totalContributions || 0;

    // count pr's from DB or github
    const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
      q: `author:${user.login} type:pr`,
      per_page: 1, // per_page does what? Answer: limits the number of results per page  How? Answer: by setting it to 1 we only get the total count of PRs
    });

    const totalPRs = prs.total_count || 0;

    // TODO: COUNT AI REVIEWS FROM DB
    const totalReviews = 44; // Placeholder value

    return {
      totalCommits,
      totalPRs,
      totalReviews,
      totalRepos,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalCommits: 0,
      totalPRs: 0,
      totalReviews: 0,
      totalRepos: 0,
    };
  }
}
