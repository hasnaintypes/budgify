"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import {
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { useBudgets } from "@/hooks/use-budgets";
import { formatCurrency } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Id } from "@/convex/_generated/dataModel";

export function BudgetOverview({ accountId }: { accountId: string }) {
  const { currentBudget, isLoading } = useBudgets(accountId as Id<"accounts">);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="items-center pb-0">
          <Skeleton className="h-6 w-[180px]" />
          <Skeleton className="h-4 w-[150px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!currentBudget) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>No budget set for this account</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center h-[250px]">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground">
            You haven't set up a budget for this account yet.
          </p>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="leading-none text-muted-foreground">
            Create a budget to track your spending and save more
          </div>
        </CardFooter>
      </Card>
    );
  }

  // Calculate budget progress percentage
  const progressPercentage = Math.min(
    Math.round((currentBudget.totalSpent / currentBudget.totalBudgeted) * 100),
    100
  );

  // Determine status
  const isOverBudget = currentBudget.totalSpent > currentBudget.totalBudgeted;
  const remaining = currentBudget.totalBudgeted - currentBudget.totalSpent;

  // Get the most used category color for the chart
  const primaryColor =
    currentBudget.categories.length > 0
      ? currentBudget.categories[0].color
      : isOverBudget
        ? "var(--destructive)"
        : "var(--primary)";

  // Prepare chart data
  const chartData = [
    {
      name: "Budget",
      value: progressPercentage,
      fill: primaryColor,
    },
  ];

  const chartConfig = {
    budget: {
      label: "Budget Used",
      color: primaryColor,
    },
  } satisfies ChartConfig;

  // Format month for display
  const displayMonth = "March 2025"; // Hardcoded as requested

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
        <CardDescription>
          {new Date(currentBudget.month + "-01").toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 pt-4">
        <ChartContainer config={chartConfig} className="mx-auto  max-h-[250px]">
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={-270}
            innerRadius="60%"
            outerRadius="100%"
            barSize={20}
            cx="50%"
            cy="50%"
          >
            <PolarGrid gridType="circle" />
            <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
            <RadialBar
              background
              dataKey="value"
              cornerRadius={30}
              label={{
                position: "center",
                fill: "var(--foreground)",
                fontSize: 32,
                fontWeight: "bold",
                formatter: (value: number) => `${value}%`,
              }}
            />
          </RadialBarChart>
        </ChartContainer>

        <div className="w-full mt-4 space-y-1">
          <div className="flex justify-between">
            <span className="text-sm font-medium">
              {formatCurrency(currentBudget.totalSpent)} of{" "}
              {formatCurrency(currentBudget.totalBudgeted)}
            </span>
            <span
              className={
                isOverBudget
                  ? "text-destructive font-medium"
                  : "text-primary font-medium"
              }
            >
              {isOverBudget
                ? "Over budget"
                : `${formatCurrency(remaining)} remaining`}
            </span>
          </div>
          <Progress
            value={progressPercentage}
            className={isOverBudget ? "bg-destructive/20" : ""}
            indicatorClassName={isOverBudget ? "bg-destructive" : ""}
            style={
              {
                "--progress-background": isOverBudget
                  ? undefined
                  : `${primaryColor}20`,
                "--progress-foreground": isOverBudget
                  ? undefined
                  : primaryColor,
              } as React.CSSProperties
            }
          />
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-3">
        <div className="flex items-center gap-2 font-medium leading-none">
          {isOverBudget ? (
            <>
              <TrendingUp className="h-4 w-4 text-destructive" />
              <span className="text-destructive">
                You're {formatCurrency(Math.abs(remaining))} over budget
              </span>
            </>
          ) : (
            <>
              <TrendingDown className="h-4 w-4 text-primary" />
              <span>You're on track with your budget</span>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
