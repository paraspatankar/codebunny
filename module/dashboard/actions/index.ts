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

// Get contribution stats (like contribution calendar) for the authenticated user
export async function getContributionStats() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("User is not authenticated");
    }

    const token = await getGithubToken();
    //Get the actual github username from the github api
    const octokit = new Octokit({ auth: token });

    // Fetch github username from database
    const { data: user } = await octokit.rest.users.getAuthenticated();

    if (!user.login) {
      throw new Error("GitHub username not found");
    }
    const username = user.login;
    const calendar = await fetchUserContributions(token, username);

    if (!calendar) {
      return null;
    }

    const contributions = calendar.weeks.flatMap((week: any) =>
      week.contributionDays.map((day: any) => ({
        date: day.date,
        count: day.contributionCount,
        level: Math.min(Math.floor(day.contributionCount / 5), 4), // Level from 0 to 4
      }))
    );

    return { contributions, totalContributions: calendar.totalContributions }; // Return only contributions array
  } catch (error) {
    console.error("Error fetching contribution stats:", error);
    return null;
  }
}

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

    // Fetch total connected repositories from database
    const totalRepos = await prisma.repository.count({
      where: {
        userId: session.user.id,
      },
    });

    const calendar = await fetchUserContributions(token, user.login);
    const totalCommits = calendar?.totalContributions || 0;

    // count pr's from DB or github
    const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
      q: `author:${user.login} type:pr`,
      per_page: 1, // per_page does what? Answer: limits the number of results per page  How? Answer: by setting it to 1 we only get the total count of PRs
    });

    const totalPRs = prs.total_count || 0;

    // Count AI reviews from database
    const totalReviews = await prisma.review.count({
      where: {
        repository: {
          userId: session.user.id,
        },
      },
    });

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

export async function getMonthlyActivity() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("User is not authenticated");
    }

    const token = await getGithubToken();
    const octokit = new Octokit({ auth: token });

    const { data: user } = await octokit.rest.users.getAuthenticated(); // Fetch github username from database, getAuthenticated is method made by octokit to get authenticated user

    if (!user.login) {
      throw new Error("GitHub username not found");
    }

    const calendar = await fetchUserContributions(token, user.login);

    if (!calendar) {
      return [];
    }

    const monthlyData: {
      [key: string]: { commits: number; prs: number; reviews: number };
    } = {};

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Initialize last 6 months in monthlyData with 0 values
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthNames[date.getMonth()];
      monthlyData[monthKey] = { commits: 0, prs: 0, reviews: 0 };
    }

    // Populate commits data
    // Iterate over contribution calendar weeks and days
    // to aggregate commits per month
    // contributionCalendar.weeks is array of weeks
    // each week has contributionDays array
    // each day has date and contributionCount

    calendar.weeks.forEach((week: any) => {
      week.contributionDays.forEach((day: any) => {
        const date = new Date(day.date);
        const monthKey = monthNames[date.getMonth()];
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].commits += day.contributionCount;
        }
      });
    });

    // Fetch reviews from database for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // TODO: REVIEWS'S REAL DATA
    const generateSampleReviews = () => {
      const sampleReviews = [];
      const now = new Date();

      // Generate random reviews over the past 6 months
      for (let i = 0; i < 45; i++) {
        const randomDaysAgo = Math.floor(Math.random() * 180); // Random day in last 6 months
        const reviewDate = new Date(now);
        reviewDate.setDate(reviewDate.getDate() - randomDaysAgo);

        sampleReviews.push({
          createdAt: reviewDate,
        });
      }

      return sampleReviews;
    };

    const reviews = generateSampleReviews();

    reviews.forEach((review) => {
      const monthKey = monthNames[review.createdAt.getMonth()];
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].reviews += 1;
      }
    });

    const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
      q: `author:${user.login} type:pr created:>${
        sixMonthsAgo.toISOString().split("T")[0]
      }`,
      per_page: 100,
    });

    prs.items.forEach((pr: any) => {
      const date = new Date(pr.created_at);
      const monthKey = monthNames[date.getMonth()];
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].prs += 1;
      }
    });

    return Object.keys(monthlyData).map((name) => ({
      name,
      ...monthlyData[name],
    }));
  } catch (error) {
    console.error("Error fetching monthly activity:", error);
    return [];
  }
}
