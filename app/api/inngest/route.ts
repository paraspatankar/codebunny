import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { indexRepo } from "../../../inngest/fucntion";
import { generateReview } from "@/inngest/fucntion/review";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    indexRepo,
    generateReview,
    /* your functions will be passed here later! */
  ],
});
