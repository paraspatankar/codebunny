import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { indexRepo } from "../../../inngest/function";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    indexRepo,
    /* your functions will be passed here later! */
  ],
});
