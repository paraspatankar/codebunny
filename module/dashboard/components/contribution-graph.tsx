"use client";
import React from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { getContributionStats } from "../actions";

// import {totalCOnt}
// import type { ContributionStats } from "../types";
// import type { theme } from "next-themes";
// import { getContributionStats} from "../actions";
// import { getCOntributionStats} from ""

const ContributionGraph = () => {
  const { theme } = useTheme(); // Access the current theme (light or dark)

  const { data, isLoading } = useQuery({
    queryKey: ["contribution-graph"],
    queryFn: async () => await getContributionStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">
          Loading Contribution Data....
        </div>
      </div>
    );
  }

  if (!data || !data.contributions.length) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8">
        <div className="text-muted-foreground">
          No contribution data available.
        </div>
      </div>
    );
  }

  //   <ActivityCalendar
  //       data={data.contributions}
  //       theme={theme}
  //       blockSize={10}
  //       blockMargin={2}
  //     />
  //change this
  return (
    <div className="w-full flex flex-col items-center gap-4 p-4 md:p-8 bg-card rounded-lg border border-border">
      <div className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">
          {data.totalContributions}
        </span>
        {/* add space here for html */}
        Contribution in the last year
      </div>

      <div className="w-full overflow-x-auto">
        <div className="flex justify-center min-w-max px-4">
          <ActivityCalendar
            data={data.contributions}
            colorScheme={theme === "dark" ? "dark" : "light"}
            blockSize={10}
            blockMargin={2}
            fontSize={14}
            showWeekdayLabels={true}
            showMonthLabels={true}
            theme={{
              light: [
                "hsl(0, 0%, 94%)", // empty
                "hsl(142, 76%, 36%)", // active
              ],
              dark: [
                "#161b22", // empty
                "hsl(142, 76%, 45%)", // active
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ContributionGraph;
