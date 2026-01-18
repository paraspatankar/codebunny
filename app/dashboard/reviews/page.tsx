"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getReviews } from "@/module/review/actions";
import { formatDistanceToNow } from "date-fns";

export default function ReviewPage() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => await getReviews(),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Review History
        </h1>
        <p className="text-muted-foreground">View all AI code reviews</p>
      </div>

      {
         reviews?.length === 0 ? (
            <Card className="border-dashed">
               <CardContent className="pt-6">
                  <div className="text-center py-16 px-4">
                     {/* Animated Bunny */}
                     <div className="mb-6 text-8xl animate-bounce">
                        🐰
                     </div>
                     
                     {/* Main Message */}
                     <h3 className="text-2xl font-bold mb-3">
                        No Reviews Yet!
                     </h3>
                     <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Your AI code review bunny is hopping with excitement! 🥕
                        <br />
                        Connect a repository and create a PR to see the magic happen.
                     </p>
                     
                     {/* Action Buttons */}
                     <div className="flex gap-3 justify-center flex-wrap">
                        <Button asChild>
                           <a href="/dashboard/repository">
                              🔗 Connect Repository
                           </a>
                        </Button>
                        <Button variant="outline" asChild>
                           <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                              📝 Create a PR
                           </a>
                        </Button>
                     </div>
                  </div>
               </CardContent>
            </Card>
         ) : (
            <div className="grid gap-4">
  {reviews?.map((review: any) => (
    <Card key={review.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{review.prTitle}</CardTitle>
              {review.status === "completed" && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Completed
                </Badge>
              )}
              {review.status === "failed" && (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Failed
                </Badge>
              )}
               {review.status === "pending" && (
                <Badge variant="secondary" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Failed
                </Badge>
              )}
            </div>
            <CardDescription>{review.repository.fullName} . PR #{review.prNumber}</CardDescription>
            <Button variant="ghost" size="icon" asChild>
               <a href={review.prUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
               </a>
               </Button>
               </div>
               </div>

               </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="bg-muted p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-xs">{review.review.substring(0, 300)}...</pre>
            </div>
          </div>
          <Button variant="outline" asChild>
            <a href={review.prUrl} target="_blank" rel="noopener noreferrer">
              View Full Review on GitHub
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
          )}
    </div>
  );
}
