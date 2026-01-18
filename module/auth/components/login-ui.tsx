"use client";

import { GithubIcon } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { useState } from "react";

const LoginUI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGithubLogin = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "github",
      });
    } catch (error) {
      console.error("GitHub login failed:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Left Section - Hero Content */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-12 py-8 md:py-16">
        <div className="max-w-lg">
          {/* Logo */}
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 text-2xl font-bold">
              <div className="w-8 h-8 bg--primary rounded-full" />
              <span className="text-primary text-6xl">CodeBunny</span>
            </div>
          </div>

          {/* Main Content */}
          <h1 className="text-5xl font-bold mb-6 leading-tight text-balance">
            Cut Code Review Time & Bugs in Half.{" "}
            <span className="block">Instantly.</span>
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Supercharge your team to ship faster with the most advanced AI code
            reviews.
          </p>
        </div>
      </div>
      {/* Right Section - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 md:px-12 py-8 md:py-16">
        <div className="w-full max-w-sm">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">
              Login using one of the following providers:
            </p>
          </div>

          {/* GitHub Login Button */}
          <button
            onClick={handleGithubLogin}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3 mb-8"
          >
            <GithubIcon size={20} />
            {isLoading ? "Signing in..." : "GitHub"}
          </button>

          {/* Info Text */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Sign in with your GitHub account to get started with AI-powered code reviews</p>
          </div>

          {/* Bottom Links */}
          <div className="mt-12 pt-8 border-t border-border flex justify-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Terms of Use
            </a>
            <span>and</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginUI;
