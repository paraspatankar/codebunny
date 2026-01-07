"use client";

import { useState, useEffect, useRef } from "react";
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
import { ExternalLink, Star, Search } from "lucide-react";
import { useRepositories } from "@/module/repository/hooks/use-repositories";
import { RepositoryListSkeleton } from "@/module/repository/components/repository-skelelton";
import { useConnectRepository } from "@/module/repository/hooks/use-connect-repository";
import { set } from "zod";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  isConnected?: boolean;
}

const RepositoryPage = () => {
  // Fetch repositories using the custom hook
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepositories();

  const [localConnectingId, setLocalConnectingId] = useState<number | null>(
    null
  );

  // Connect repository
  const { mutate: connectRepo } = useConnectRepository();
  const [searchQuery, setSearchQuery] = useState("");

  const observerTarget = useRef<HTMLDivElement | null>(null);

  // Infinite scrolling effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground">
            Manage and view all your Github repositories
          </p>
        </div>
        <RepositoryListSkeleton />
      </div>
    );
  }

  const allRepositories = data?.pages.flatMap((page) => page) || [];

  // Filter repositories based on search query
  const filteredRepositories = allRepositories.filter(
    (repo: Repository) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Placeholder for connect handler
  const handleConnect = (repo: Repository) => {
    setLocalConnectingId(repo.id);
    connectRepo(
      {
        owner: repo.full_name.split("/")[0],
        repo: repo.name,
        githubId: repo.id,
      },
      {
        onSettled: () => {
          setLocalConnectingId(null);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Repositories
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage and view all your Github repositories{" "}
        </p>
      </div>

      <div className="relative">
        {/* TODO: Add filteration for connected and not connected */}
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-secondary" />
        <Input
          placeholder="Search Repositories..."
          className="pl-8  w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredRepositories.map((repo: any) => (
          <Card key={repo.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-2">
                  <CardTitle className="flex items-center gap-2">
                    {repo.name}
                  </CardTitle>
                  <Badge variant="outline">{repo.language || "Unknown"}</Badge>
                  {repo.isConnected && (
                    <Badge variant="secondary">Connected</Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button
                    className="hover:cursor-pointer"
                    onClick={() => handleConnect(repo)}
                    disabled={localConnectingId === repo.id || repo.isConnected}
                    variant={repo.isConnected ? "outline" : "default"}
                  >
                    {localConnectingId === repo.id
                      ? "Connecting..."
                      : repo.isConnected
                      ? "Connected"
                      : "Connect"}
                  </Button>
                </div>
              </div>
              <CardDescription>{repo.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm font-medium">
                      {repo.stargazers_count}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div ref={observerTarget} className="py-4">
        {isFetchingNextPage && <RepositoryListSkeleton />}
        {!hasNextPage && allRepositories.length > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No More Repositories.
          </p>
        )}
      </div>
    </div>
  );
};

export default RepositoryPage;
