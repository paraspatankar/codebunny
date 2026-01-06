import { Octokit } from "octokit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { types } from "util";

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
