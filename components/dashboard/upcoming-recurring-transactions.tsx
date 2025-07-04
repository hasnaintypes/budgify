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
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CalendarClock,
  ArrowUpIcon,
  ArrowDownIcon,
  RefreshCw,
} from "lucide-react";
import { useRecurringTransactions } from "@/hooks/use-recurring-transactions";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export function UpcomingRecurringTransactions() {
  const { user } = useUser();

  const userData = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const { activeRecurringTransactions, isLoading } = useRecurringTransactions(
    userData?._id || null
  );

  // Get next 5 upcoming transactions
  const upcomingTransactions =
    activeRecurringTransactions
      ?.filter((t) => t.isActive)
      .sort((a, b) => a.nextDueDate - b.nextDueDate)
      .slice(0, 5) || [];

  const getNextDueText = (nextDueDate: number) => {
    const now = Date.now();
    const timeDiff = nextDueDate - now;

    if (timeDiff < 0) {
      return "Overdue";
    }

    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return "Today";
    } else if (days === 1) {
      return "Tomorrow";
    } else if (days <= 7) {
      return `${days} days`;
    } else {
      return `${Math.ceil(days / 7)} weeks`;
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "DAILY":
        return "Daily";
      case "WEEKLY":
        return "Weekly";
      case "MONTHLY":
        return "Monthly";
      case "YEARLY":
        return "Yearly";
      default:
        return frequency;
    }
  };

  return (
    <Card className="h-[400px]">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Upcoming Recurring
          </CardTitle>
          <CardDescription>Next scheduled transactions</CardDescription>
        </div>
        <Link href="/manage">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Manage
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
                <Skeleton className="h-4 w-[80px]" />
              </div>
            ))}
          </div>
        ) : upcomingTransactions.length > 0 ? (
          <ScrollArea className="h-[280px] pr-4">
            <div className="space-y-4">
              {upcomingTransactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        transaction.type === "income"
                          ? "bg-emerald-100 dark:bg-emerald-900"
                          : "bg-rose-100 dark:bg-rose-900"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUpIcon className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <ArrowDownIcon className="h-5 w-5 text-rose-500" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <p className="font-medium text-sm">
                        {transaction.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {getFrequencyLabel(transaction.frequency)}
                        </Badge>
                        <span
                          className={`text-xs ${
                            transaction.nextDueDate < Date.now()
                              ? "text-red-600 dark:text-red-400 font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {getNextDueText(transaction.nextDueDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-medium ${
                        transaction.type === "income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-[280px] items-center justify-center">
            <div className="text-center">
              <CalendarClock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                No upcoming recurring transactions
              </p>
              <p className="text-sm text-muted-foreground">
                Set up recurring transactions to see them here
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
