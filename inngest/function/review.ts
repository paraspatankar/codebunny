import { inngest } from "../client";
import {
  getPullRequestDiff,
  postReviewComment,
} from "@/module/github/lib/github";
import { retrieveContext } from "@/module/ai/lib/rag";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import prisma from "@/lib/db";

export const generateReview = inngest.createFunction(
  { id: "generate-review", concurrency: 5 },
  { event: "pr.review.requested" },

  async ({ event, step }) => {
    const { owner, repo, prNumber, userId } = event.data;

    const { diff, title, description, token } = await step.run(
      "fetch-pr-data",
      async () => {
        const account = await prisma.account.findFirst({
          where: {
            userId: userId,
            providerId: "github",
          },
        });

        if (!account?.accessToken) {
          throw new Error("No GitHub access token found for this user");
        }

        const data = await getPullRequestDiff(
          account.accessToken,
          owner,
          repo,
          prNumber
        );

        return { ...data, token: account.accessToken };
      }
    );

    const context = await step.run("retrieve-context", async () => {
      const query = `${title}\n${description}`;

      return await retrieveContext(query, `${owner}/${repo}`); //Why we are doing this?? The retirive context() will accept the query and we will get embeddings from it from generateembedding() and then we will pass it to pinecone to get the context
    });

    const review = await step.run("generate-ai-review", async () => {
      const prompt = `You are a **Senior Software Engineer and Code Review Expert** with 10+ years of experience. Your expertise includes security vulnerabilities, performance optimization, clean code principles, testing best practices, and software architecture.

**YOUR MISSION**: Provide a thorough, actionable, and constructive code review that helps developers write better, safer, and more maintainable code.

---

## 📋 PULL REQUEST DETAILS

**Title**: ${title}
**Description**: ${description || "No description provided"}

---

## 🧠 CODEBASE CONTEXT

The following code snippets from the repository provide context about existing patterns, conventions, and related functionality:

${context.length > 0 ? context.join("\n\n---\n\n") : "No additional context available."}

**Use this context to**:
- Check consistency with existing patterns
- Identify breaking changes
- Spot deviations from established conventions
- Suggest improvements aligned with the codebase style

---

## 📝 CODE CHANGES

\`\`\`diff
${diff}
\`\`\`

---

## 🎯 YOUR REVIEW STRUCTURE

Provide your review in the following format using **markdown**:

### 1. 📊 Summary
A concise 2-3 sentence overview of what this PR does and its overall quality.

### 2. 🗺️ Walkthrough
A **file-by-file walkthrough** explaining what changed and why it matters. Format:
- **\`filename.ext\`**: Brief description of changes and their purpose

### 3. 🔄 Sequence Diagram (if applicable)
If the changes involve a workflow, API calls, or multi-step process, provide a **Mermaid sequence diagram**:
\`\`\`mermaid
sequenceDiagram
    participant User
    participant API
    API->>Database: Query data
    Database-->>API: Return results
\`\`\`

**CRITICAL**: Keep diagrams simple. Avoid special characters in labels and notes (no quotes, parentheses, or braces inside text).

### 4. ✅ Strengths
List 2-4 things done well in this PR:
- ✨ Good practice or clever solution
- 📚 Excellent documentation or clear code
- 🎯 Proper error handling or edge cases covered

### 5. 🔍 Issues & Suggestions

**Categorize by severity:**

#### 🔴 **Critical** (Security, Breaking Changes, Major Bugs)
- **Issue**: Clear description
- **Impact**: What could go wrong
- **Fix**: Specific code suggestion or approach

#### 🟡 **Major** (Performance, Code Quality, Maintainability)
- **Issue**: Description
- **Suggestion**: How to improve

#### 🔵 **Minor** (Nitpicks, Style, Optimizations)
- **Issue**: Description
- **Suggestion**: Quick improvement

**FOCUS ON**:
- 🔒 **Security**: SQL injection, XSS, authentication issues, sensitive data exposure
- ⚡ **Performance**: N+1 queries, unnecessary loops, memory leaks, inefficient algorithms
- 🧪 **Testing**: Missing edge cases, inadequate test coverage, brittle tests
- 📖 **Documentation**: Missing JSDoc, unclear variable names, magic numbers
- 🏗️ **Architecture**: Tight coupling, code duplication, violation of SOLID principles
- 🐛 **Bugs**: Logic errors, race conditions, null pointer exceptions

**If no issues found in a category, skip it.**

### 6. 📋 Checklist
- [ ] Security concerns addressed
- [ ] Performance is acceptable
- [ ] Tests cover new functionality
- [ ] Documentation is clear
- [ ] Code follows project conventions
- [ ] No breaking changes (or properly documented)

### 7. 🎭 Poem
End with a **short, creative poem** (4-8 lines) that captures the essence of this PR. Make it fun, maybe a bit sarcastic, or genuinely inspiring. Channel your inner poet! 🥹

---

**Remember**: Be constructive, specific, and kind. Your goal is to help, not criticize. Focus on **actionable feedback** the developer can immediately act on.`;

      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        prompt,
      });

      return text;
    });

    await step.run("post-comment", async () => {
      await postReviewComment(token, owner, repo, prNumber, review);
    });

    await step.run("save-review", async () => {
      const repository = await prisma.repository.findFirst({
        where: {
          owner: owner,
          name: repo,
        },
      });

      if (repository) {
        await prisma.review.create({
          data: {
            repositoryId: repository.id,
            prNumber: prNumber,
            prTitle: title,
            prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
            review: review,
            status: "completed",
          },
        });
      } else {
        console.warn(`Repository ${owner}/${repo} not found, skipping review persistence`);
      }
    });

    return { success: true };
  }
);
