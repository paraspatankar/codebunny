# Contributing to CodeBunny

First off, thank you for considering contributing to CodeBunny! 🐰

This document provides guidelines and steps for contributing. Following these guidelines helps communicate that you respect the time of the developers managing and developing this open source project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [patankarparas@gmail.com](mailto:patankarparas@gmail.com).

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/codebunny.git
   cd codebunny
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/paraspatankar/codebunny.git
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 💡 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Describe the behavior you observed and what you expected**
- **Include screenshots** if applicable
- **Include your environment details** (OS, Node version, browser, etc.)

### ✨ Suggesting Features

Feature suggestions are tracked as GitHub issues. When creating a feature request:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the proposed feature
- **Explain why this feature would be useful**
- **Include mockups or examples** if possible

### 🔧 Pull Requests

- Fill in the pull request template
- Follow the [style guidelines](#style-guidelines)
- Include appropriate test coverage if applicable
- Update documentation as needed

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- Bun (recommended) or npm
- PostgreSQL
- Git

### Setup Steps

1. Install dependencies:
   ```bash
   bun install
   ```

2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

3. Fill in your environment variables (see README for details)

4. Set up the database:
   ```bash
   bun prisma generate
   bun prisma migrate dev
   ```

5. Start the development server:
   ```bash
   bun run dev
   ```

6. In a separate terminal, start Inngest:
   ```bash
   npx inngest-cli@latest dev
   ```

## 🔀 Pull Request Process

1. **Ensure your code follows the style guidelines**
2. **Update the README.md** if your changes affect setup or usage
3. **Make sure all tests pass** (if applicable)
4. **Keep pull requests focused** - one feature/fix per PR
5. **Write a clear PR description** explaining:
   - What changes you made
   - Why you made them
   - Any relevant issue numbers

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/dark-mode`)
- `fix/` - Bug fixes (e.g., `fix/login-error`)
- `docs/` - Documentation changes (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/auth-module`)
- `chore/` - Maintenance tasks (e.g., `chore/update-deps`)

## 📝 Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Use meaningful variable and function names
- Keep functions small and focused
- Add comments for complex logic
- Use async/await over raw Promises

### React/Next.js

- Use functional components with hooks
- Keep components small and reusable
- Use proper TypeScript types for props
- Follow the existing project structure

### CSS/Styling

- Use TailwindCSS utility classes
- Follow the existing design system
- Ensure responsive design
- Use Shadcn/UI components when possible

### File Organization

- Place new components in appropriate directories
- Follow the existing folder structure
- Keep related files together

## 💬 Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(dashboard): add contribution graph component

fix(auth): resolve GitHub OAuth callback error

docs(readme): update installation instructions

refactor(api): simplify webhook handling logic
```

## ❓ Questions?

Feel free to open an issue for any questions or reach out to [patankarparas@gmail.com](mailto:patankarparas@gmail.com).

---

Thank you for contributing to CodeBunny! 🎉
