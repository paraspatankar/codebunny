import { Octokit } from "octokit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { types } from "util";
import dotenv from "dotenv";

dotenv.config();

/* ***
 * Getting the Github access token from the database for the logged-in user
 *
 *
 *
 * ** */

export const getGithubToken = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("User is not authenticated");
  }

  //This is where we get the github access token from the database
  const account = await prisma.account.findFirst({
    //find first because there could be multiple accounts for user logged in via multiple oauth providers
    where: {
      userId: session.user.id,
      providerId: "github",
    },
  });

  if (!account?.accessToken) {
    throw new Error("No GitHub access token found for this user");
  }

  return account.accessToken;
};

export async function fetchUserContributions(token: string, username: string) {
  const octokit = new Octokit({ auth: token });

  // GraphQL query to fetch user contributions and calendar data to make the contribution graph (octokit have graphql method built in to make graphql requests)
  const query = `
     query($username: String!) {    
       user(login: $username) {
         contributionsCollection {
           contributionCalendar {
             totalContributions
             weeks {
               contributionDays {
                 date
                 contributionCount
                 color
               }
             }
           }
         }
       }
  }`;

  // Define the TypeScript interface for the expected response in next try catckh block
  interface contributionData {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: {
            contributionDays: {
              date: string | Date;
              contributionCount: number;
              color: string;
            }[]; // Array of contribution days
          }[]; // Array of weeks
        };
      };
    };
  }

  try {
    const response: contributionData = await octokit.graphql(query, {
      username,
    });

    return response.user.contributionsCollection.contributionCalendar;
  } catch (error) {
    console.error("Error fetching user contributions:", error);
    throw error;
  }
}

export const getRepositories = async (
  page: number = 1,
  per_page: number = 10
) => {
  const token = await getGithubToken();
  const octokit = new Octokit({ auth: token });

  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    direction: "desc",
    visibility: "all",
    per_page: per_page,
    page: page,
  });

  return data;
};

export const createWebhook = async (owner: string, repo: string) => {
  const token = await getGithubToken();
  const octokit = new Octokit({ auth: token });

  // Create the webhook
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`;

  const { data: hooks } = await octokit.rest.repos.listWebhooks({
    owner,
    repo,
  });

  // Check if the webhook already exists
  const existingHook = hooks.find((hook) => hook.config.url === webhookUrl);

  if (existingHook) {
    return existingHook;
  }

  const { data } = await octokit.rest.repos.createWebhook({
    owner,
    repo,
    config: {
      url: webhookUrl,
      content_type: "json",
    },
    events: ["pull_request"],
  });

  return data;
};
