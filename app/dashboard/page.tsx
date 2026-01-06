"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  MessageSquare,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useQuery } from "@tanstack/react-query";

import {
  getDashboardStats,
  getMonthlyActivity,
} from "@/module/dashboard/actions";
import ContributionGraph from "@/module/dashboard/components/contribution-graph";
import { Spinner } from "@/components/ui/spinner";

const MainPage = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => await getDashboardStats(),
    refetchOnWindowFocus: false,
  });

  const { data: monthlyActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["monthly-activity"],
    queryFn: async () => await getMonthlyActivity(),
    refetchOnWindowFocus: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Welcome to your Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of your coding activity and AI reviews
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Repositories Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Repositories{" "}
            </CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats?.totalRepos || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Connected Repositories
            </p>
          </CardContent>
        </Card>

        {/* Total Commits Card  */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commits</CardTitle>
            <GitCommit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : (stats?.totalCommits || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">In the last year</p>
          </CardContent>
        </Card>

        {/* Total Pull Requests Card  */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pull Requests
            </CardTitle>
            <GitPullRequest className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : (stats?.totalPRs || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total Pull Requests</p>
          </CardContent>
        </Card>

        {/* Total AI Reviews Card  */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : (stats?.totalReviews || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Generated Reviews</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contribution Activity</CardTitle>
          <CardDescription>
            Visualizing your coding frequency over the last year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContributionGraph />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Activity Review</CardTitle>
            <CardDescription>
              {" "}
              Monthly breakdown of commits, PR's and reviews{" "}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-96">
            {isLoadingActivity ? (
              <div className="w-full h-full flex items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyActivity || []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      cursor={false}
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                      }}
                      itemStyle={{ color: "var(--foreground)" }}
                    />

                    <Legend />
                    <Bar
                      dataKey="commits"
                      name="Commits"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="prs"
                      name="Pull Requests"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="reviews"
                      name="AI Reviews"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MainPage;
