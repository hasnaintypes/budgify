"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency, formatDate } from "@/lib/utils";

export function RecentTransactions() {
  const { data, isLoading } = useTransactions({ limit: 5 });

  return (
    <Card className="h-[400px] shadow-sm">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest 5 transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {data.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
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
                    <div className="flex flex-col items-start">
                      <p className="text-sm font-medium">
                        {transaction.description}
                      </p>
                      <Badge
                        variant={
                          transaction.type === "income"
                            ? "outline"
                            : "secondary"
                        }
                        className={`mt-1 ${
                          transaction.type === "income"
                            ? "text-emerald-500 border-emerald-200"
                            : "text-rose-500"
                        }`}
                      >
                        {transaction.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`font-medium ${
                        transaction.type === "income"
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-[300px] items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground">
                Add your first transaction to see it here
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
