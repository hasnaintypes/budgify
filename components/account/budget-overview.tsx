"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
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

export function BudgetOverview({ accountId }: { accountId: string }) {
  const { currentBudget, isLoading } = useBudgets(accountId);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
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
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>No budget set for this account</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[250px]">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground">
            You haven't set up a budget for this account yet.
          </p>
        </CardContent>
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

  // Prepare chart data
  const chartData = [
    {
      name: "Budget",
      value: progressPercentage,
      fill: isOverBudget ? "var(--destructive)" : "var(--primary)",
    },
  ];

  const chartConfig = {
    value: {
      label: "Budget Used",
    },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Budget Overview</CardTitle>
        <CardDescription>
          {new Date(currentBudget.month + "-01").toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-[250px] aspect-square">
            <ChartContainer config={chartConfig}>
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
                <PolarRadiusAxis
                  tick={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
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
                <text
                  x="50%"
                  y="55%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-sm"
                >
                  of budget used
                </text>
              </RadialBarChart>
            </ChartContainer>
          </div>

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
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-4 text-sm pt-4">
        <div className="flex items-center gap-2 font-medium leading-none">
          {isOverBudget ? (
            <>
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-destructive">
                You're {formatCurrency(Math.abs(remaining))} over budget
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>You're on track with your budget</span>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
