"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, DollarSignIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSummaryData } from "@/hooks/use-summary-data";
import { DateRangePicker } from "@/components/ui/date-range-picker";

export function Overview() {
  const [date, setDate] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(2025, 2, 1), // March 1, 2025
    to: new Date(2025, 2, 25), // March 25, 2025
  });

  const { data, isLoading } = useSummaryData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <DateRangePicker
          date={date}
          setDate={setDate}
          className="w-full sm:w-auto"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[120px]" />
            ) : (
              <div className="text-2xl font-bold">
                ${data?.total.toFixed(2)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[120px]" />
            ) : (
              <div className="text-2xl font-bold text-emerald-500">
                ${data?.income.toFixed(2)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              +10.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[120px]" />
            ) : (
              <div className="text-2xl font-bold text-rose-500">
                ${data?.expenses.toFixed(2)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              +12.3% from last month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
