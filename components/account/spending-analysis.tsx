"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useBudgets } from "@/hooks/use-budgets";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

export function SpendingAnalysis({ accountId }: { accountId: string }) {
  const { currentBudget, isLoading } = useBudgets(accountId);

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
          <CardTitle>Spending Analysis</CardTitle>
          <CardDescription>No budget data available</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[250px]">
          <p className="text-center text-muted-foreground">
            Set up a budget to see your spending analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data - top 5 categories by spending
  const chartData = [...currentBudget.categories]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5)
    .map((category) => ({
      name: category.name,
      spent: category.spent,
      budgeted: category.budgeted,
      fill: category.color,
    }));

  const chartConfig = {
    spent: {
      label: "Spent",
      color: "hsl(var(--chart-1))",
    },
    budgeted: {
      label: "Budgeted",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Spending Categories</CardTitle>
        <CardDescription>
          {new Date(currentBudget.month + "-01").toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            layout="horizontal"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(value as number)}
                />
              }
            />
            <Bar
              dataKey="spent"
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
              barSize={30}
              name="Spent"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {currentBudget.totalSpent > currentBudget.totalBudgeted ? (
            <>
              <TrendingUp className="h-4 w-4 text-destructive" />
              <span className="text-destructive">
                Spending exceeds budget by{" "}
                {formatCurrency(
                  currentBudget.totalSpent - currentBudget.totalBudgeted
                )}
              </span>
            </>
          ) : (
            <>
              <TrendingDown className="h-4 w-4 text-primary" />
              <span>
                Spending under budget by{" "}
                {formatCurrency(
                  currentBudget.totalBudgeted - currentBudget.totalSpent
                )}
              </span>
            </>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing top 5 spending categories
        </div>
      </CardFooter>
    </Card>
  );
}
