import { reviewPullRequest } from "@/module/ai/actions";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // this is beacause this is how github sends the webhook
    const event = req.headers.get("X-github-event");

    console.log(`Received Github event: ${event}`);
    if (event === "Ping") {
      return NextResponse.json({ message: "Pong" }, { status: 200 });
    }

    if (event === "pull_request") {
      const action = body.action;
      const reop = body.repository.full_name;
      const prNumber = body.number;

      const [owner, repoName] = reop.split("/");

      if (action === "opened" || action === "synchronize") {
        reviewPullRequest(owner, repoName, prNumber)
          .then(() => console.log(`Review completed for ${repoName} #${prNumber}`))
          .catch((error: any) =>
            console.error(
              `Error processing pull request ${repoName} #${prNumber} : ${error}`
            )
          );
      }
    }

    //TODO: HANDLE PULL REQUESTS
    // if(event === "pull_request"){
    //    return NextResponse.json({ message: "Pull request" } , { status: 200 });
    // }

    return NextResponse.json({ message: "Event Processed" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
