<p align="center">
  <img src="public/logo.png" alt="CodeBunny Logo" width="120" />
</p>

<h1 align="center">🐰 CodeBunny</h1>

<p align="center">
  <strong>AI-Powered Code Reviews for GitHub Pull Requests</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#environment-variables">Environment</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## ✨ Features

- **🤖 AI-Powered Reviews** - Automatically generate intelligent code reviews for your pull requests using Google's Gemini AI
- **🔗 GitHub Integration** - Seamlessly connect your repositories with one-click OAuth authentication
- **📊 Dashboard Analytics** - Track your coding activity, commits, PRs, and AI reviews with beautiful visualizations
- **🎯 RAG-Enhanced Context** - Retrieval-Augmented Generation using Pinecone for codebase-aware reviews
- **⚡ Real-time Processing** - Background job processing with Inngest for non-blocking review generation
- **📈 Contribution Graphs** - Visualize your coding frequency over time
- **🌙 Modern UI** - Beautiful, responsive interface built with Shadcn/UI and TailwindCSS

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [TailwindCSS 4](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/) |
| **Authentication** | [Better Auth](https://better-auth.com/) (GitHub OAuth) |
| **AI** | [Google Gemini](https://ai.google.dev/) via [AI SDK](https://sdk.vercel.ai/) |
| **Vector Store** | [Pinecone](https://www.pinecone.io/) |
| **Background Jobs** | [Inngest](https://www.inngest.com/) |
| **Data Fetching** | [TanStack Query](https://tanstack.com/query) |
| **Package Manager** | [Bun](https://bun.sh/) |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Bun](https://bun.sh/) (recommended) or npm/yarn/pnpm
- [PostgreSQL](https://www.postgresql.org/) database
- [Git](https://git-scm.com/)

You'll also need accounts for:
- [GitHub](https://github.com/) (for OAuth app)
- [Google AI Studio](https://makersuite.google.com/) (for Gemini API key)
- [Pinecone](https://www.pinecone.io/) (for vector storage)
- [Inngest](https://www.inngest.com/) (for background jobs)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/codebunny.git
cd codebunny
```

### 2. Install Dependencies

```bash
bun install
# or
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

See [Environment Variables](#environment-variables) for detailed configuration.

### 4. Set Up the Database

```bash
# Generate Prisma client
bun prisma generate

# Run migrations
bun prisma migrate dev
```

### 5. Start the Development Server

```bash
bun run dev
```

### 6. Start Inngest Dev Server (in a separate terminal)

```bash
npx inngest-cli@latest dev
```

### 7. (Optional) Expose Local Server for Webhooks

For GitHub webhooks during development, use [ngrok](https://ngrok.com/):

```bash
ngrok http 3000
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/codebunny"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Google AI (Gemini)
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"

# Pinecone
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_INDEX="your-index-name"

# Inngest (optional for local dev)
INNGEST_EVENT_KEY="your-inngest-event-key"
INNGEST_SIGNING_KEY="your-inngest-signing-key"
```

### Getting API Keys

| Service | How to Get |
|---------|-----------|
| **GitHub OAuth** | [Create OAuth App](https://github.com/settings/developers) → Set callback URL to `http://localhost:3000/api/auth/callback/github` |
| **Google Gemini** | [Google AI Studio](https://makersuite.google.com/app/apikey) → Create API key |
| **Pinecone** | [Pinecone Console](https://app.pinecone.io/) → Create account → Get API key |
| **Inngest** | [Inngest Dashboard](https://app.inngest.com/) → Create account → Get keys |

## 📁 Project Structure

```
codebunny/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── api/               # API routes & webhooks
│   └── dashboard/         # Dashboard pages
├── components/            # Reusable UI components
│   └── ui/               # Shadcn/UI components
├── hooks/                 # Custom React hooks
├── inngest/              # Inngest background functions
│   └── function/         # Review generation logic
├── lib/                   # Utility functions & configs
├── module/               # Feature modules
│   ├── ai/              # AI review logic
│   ├── auth/            # Authentication utilities
│   ├── dashboard/       # Dashboard actions
│   ├── github/          # GitHub API integration
│   ├── repository/      # Repository management
│   ├── review/          # Review management
│   └── settings/        # User settings
├── prisma/               # Database schema & migrations
└── public/               # Static assets
```

## 🔄 How It Works

1. **Connect Repository** - User authenticates with GitHub and connects their repositories
2. **Webhook Setup** - CodeBunny registers a webhook on the connected repository
3. **PR Event** - When a pull request is opened or updated, GitHub sends a webhook
4. **AI Processing** - Inngest picks up the event and:
   - Fetches the PR diff from GitHub
   - Retrieves relevant context from Pinecone (RAG)
   - Generates a comprehensive review using Gemini AI
5. **Post Review** - The AI review is posted as a comment on the PR
6. **Dashboard** - User can view all reviews and analytics in the dashboard

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a pull request.

## 🔒 Security

For security concerns, please review our [Security Policy](SECURITY.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/paraspatankar">Paras Patankar</a>
</p>
