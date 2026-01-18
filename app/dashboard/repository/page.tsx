"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ExternalLink,
  Star,
  Search,
  GitFork,
  AlertCircle,
  FolderGit2,
  Loader2,
  CheckCircle2,
  Link2,
} from "lucide-react";
import { useRepositories } from "@/module/repository/hooks/use-repositories";
import { RepositoryListSkeleton } from "@/module/repository/components/repository-skelelton";
import { useConnectRepository } from "@/module/repository/hooks/use-connect-repository";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count?: number;
  language: string | null;
  topics: string[];
  isConnected?: boolean;
}

// Language color mapping for visual distinction
const languageColors: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-500",
  Rust: "bg-orange-500",
  Go: "bg-cyan-500",
  Java: "bg-red-500",
  "C++": "bg-pink-500",
  C: "bg-gray-500",
  Ruby: "bg-red-600",
  PHP: "bg-purple-500",
  Swift: "bg-orange-400",
  Kotlin: "bg-violet-500",
  Dart: "bg-teal-500",
  HTML: "bg-orange-600",
  CSS: "bg-blue-400",
  Shell: "bg-green-400",
  Vue: "bg-emerald-500",
};

const RepositoryPage = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepositories();

  const [localConnectingId, setLocalConnectingId] = useState<number | null>(
    null
  );
  const [connectedRepoIds, setConnectedRepoIds] = useState<Set<number>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const observerTarget = useRef<HTMLDivElement | null>(null);

  const { mutate: connectRepo } = useConnectRepository();

  // Infinite scrolling effect with proper cleanup
  useEffect(() => {
    const currentTarget = observerTarget.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleConnect = useCallback(
    (repo: Repository) => {
      setLocalConnectingId(repo.id);
      connectRepo(
        {
          owner: repo.full_name.split("/")[0],
          repo: repo.name,
          githubId: repo.id,
        },
        {
          onSuccess: () => {
            setConnectedRepoIds((prev) => new Set(prev).add(repo.id));
          },
          onSettled: () => {
            setLocalConnectingId(null);
          },
        }
      );
    },
    [connectRepo]
  );

  const isRepoConnected = useCallback(
    (repo: Repository) => repo.isConnected || connectedRepoIds.has(repo.id),
    [connectedRepoIds]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Repositories
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all your GitHub repositories
          </p>
        </div>
        <RepositoryListSkeleton />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Repositories
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all your GitHub repositories
          </p>
        </div>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-destructive/10 p-4 mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Failed to load repositories
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              {error instanceof Error
                ? error.message
                : "Something went wrong while fetching your repositories. Please try again."}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allRepositories = data?.pages.flatMap((page) => page) || [];

  // Filter repositories based on search query
  const filteredRepositories = allRepositories.filter(
    (repo: Repository) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.language?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Connected count for stats
  const connectedCount = allRepositories.filter(
    (repo: Repository) => isRepoConnected(repo)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Repositories
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all your GitHub repositories
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50">
            <FolderGit2 className="h-4 w-4" />
            <span className="font-medium">{allRepositories.length}</span>
            <span>repositories</span>
          </div>
          {connectedCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">{connectedCount}</span>
              <span>connected</span>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, description, or language..."
          className="pl-10 h-11"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {filteredRepositories.length} results
          </span>
        )}
      </div>

      {/* Empty State */}
      {allRepositories.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FolderGit2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No repositories found</h3>
            <p className="text-muted-foreground max-w-md">
              We couldn&apos;t find any repositories in your GitHub account.
              Make sure your account is properly connected.
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Search Results State */}
      {allRepositories.length > 0 && filteredRepositories.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No matching repositories</h3>
            <p className="text-muted-foreground mb-4">
              No repositories match &quot;{searchQuery}&quot;
            </p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Repository Grid */}
      <div className="grid gap-4">
        {filteredRepositories.map((repo: Repository) => {
          const connected = isRepoConnected(repo);
          const isConnecting = localConnectingId === repo.id;
          const langColor = languageColors[repo.language || ""] || "bg-gray-400";

          return (
            <Card
              key={repo.id}
              className="group hover:shadow-lg transition-all duration-200 hover:border-primary/30"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <CardTitle className="text-lg truncate">
                        {repo.name}
                      </CardTitle>
                      {repo.language && (
                        <Badge variant="outline" className="gap-1.5 font-normal">
                          <span className={`h-2 w-2 rounded-full ${langColor}`} />
                          {repo.language}
                        </Badge>
                      )}
                      {connected && (
                        <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/20 border-0">
                          <CheckCircle2 className="h-3 w-3" />
                          Connected
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {repo.description || "No description provided"}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      asChild
                    >
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open repository on GitHub"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      onClick={() => handleConnect(repo)}
                      disabled={isConnecting || connected}
                      variant={connected ? "outline" : "default"}
                      className="gap-2 min-w-[110px]"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Connecting
                        </>
                      ) : connected ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Connected
                        </>
                      ) : (
                        <>
                          <Link2 className="h-4 w-4" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">
                      {repo.stargazers_count.toLocaleString()}
                    </span>
                  </div>
                  {typeof repo.forks_count === "number" && (
                    <div className="flex items-center gap-1.5">
                      <GitFork className="h-4 w-4" />
                      <span className="font-medium">
                        {repo.forks_count.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {repo.topics && repo.topics.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {repo.topics.slice(0, 4).map((topic) => (
                        <Badge
                          key={topic}
                          variant="secondary"
                          className="text-xs font-normal px-2 py-0"
                        >
                          {topic}
                        </Badge>
                      ))}
                      {repo.topics.length > 4 && (
                        <span className="text-xs text-muted-foreground">
                          +{repo.topics.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Infinite scroll observer target */}
      <div ref={observerTarget} className="py-4">
        {isFetchingNextPage && <RepositoryListSkeleton />}
        {!hasNextPage && allRepositories.length > 0 && filteredRepositories.length > 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            You&apos;ve reached the end — {allRepositories.length} repositories loaded
          </p>
        )}
      </div>
    </div>
  );
};

export default RepositoryPage;
