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

export const deleteWebhook = async (owner: string, repo: string) => {
  const token = await getGithubToken();
  const octokit = new Octokit({ auth: token });
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`;

  try {
    const { data: hooks } = await octokit.rest.repos.listWebhooks({
      owner,
      repo,
    });

    const hookToDelete = hooks.find((hook) => hook.config.url === webhookUrl);

    if (hookToDelete) {
      await octokit.rest.repos.deleteWebhook({
        owner,
        repo,
        hook_id: hookToDelete.id,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting webhook:", error);
    return false;
  }
};

export async function getRepoFileContents(
  token: string,
  owner: string,
  repo: string,
  path: string = ""
): Promise<{ path: string; content: string }[]> {
  const octokit = new Octokit({ auth: token });

  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
  });

  if (!Array.isArray(data)) {
    // It's a file

    if (data.type === "file" && data.content) {
      return [
        {
          path: data.path,
          content: Buffer.from(data.content, "base64").toString("utf-8"),
        },
      ];
    }

    return [];
  }

  let files: { path: string; content: string }[] = [];

  for (const item of data) {
    if (item.type === "file") {
      // Skip binary files early to avoid unnecessary API calls
      if (
        !item.path.match(
          /\.(png|jpg|jpeg|gif|svg|ico|pdf|zip|tar|gz|woff|woff2|ttf|eot|mp3|mp4|webm|exe|dll|so|dylib)$/i
        )
      ) {
        try {
          const { data: fileData } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: item.path,
          });

          if (
            !Array.isArray(fileData) &&
            fileData.type === "file" &&
            fileData.content
          ) {
            files.push({
              path: item.path,
              content: Buffer.from(fileData.content, "base64").toString(
                "utf-8"
              ),
            });
          }
        } catch (error) {
          console.error(`Failed to fetch file ${item.path}:`, error);
        }
      }
    } else if (item.type === "dir") {
      const subFiles = await getRepoFileContents(token, owner, repo, item.path);
      files = files.concat(subFiles);
      // files = [...files, ...subFiles];
    }
  }

  return files;
}

export async function getPullRequestDiff(
  token: string,
  owner: string,
  repo: string,
  prNumber: number
) {
  const octokit = new Octokit({ auth: token });

  const { data: pr } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });

  const { data: diff } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
    mediaType: {
      format: "diff",
    },
  });

  return {
    diff: diff as unknown as string,
    title: pr.title,
    description: pr.body || "",
  };
}

export async function postReviewComment(
  token: string,
  owner: string,
  repo: string,
  prNumber: number,
  review: string
) {
  const octokit = new Octokit({ auth: token });

  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body: `## AI Code Review\n\n ${review}\n\n---\n*Powered by CodeBunny*`,
  });
}
// export const getRepoFileContents : Promise<{ path: string; content: string }>[]= async (
//   token:string,
//   owner: string,
//   repo: string,
//   path:string = ""
// ) => {
//   return (
//     path:""
//   )
// };
