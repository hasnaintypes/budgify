"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCategoryData } from "@/hooks/use-category-data";
import { formatCurrency } from "@/lib/utils";

export function CategoryBreakdown() {
  const { data, isLoading } = useCategoryData();

  return (
    <Card className="h-[400px] shadow-sm">
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>Your spending by category</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="expenses">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
          </TabsList>
          <TabsContent value="expenses" className="mt-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[60px]" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : data?.expenses && data.expenses.length > 0 ? (
              <ScrollArea className="h-[220px] pr-4">
                <div className="space-y-4">
                  {data.expenses.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          {category.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(category.amount)}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary">
                        <div
                          className="h-2 rounded-full bg-rose-500"
                          style={{
                            width: `${
                              (category.amount / data.expensesTotal) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex h-[220px] items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">No expense data</p>
                  <p className="text-sm text-muted-foreground">
                    Add expenses to see your breakdown
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="income" className="mt-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[60px]" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : data?.income && data.income.length > 0 ? (
              <ScrollArea className="h-[220px] pr-4">
                <div className="space-y-4">
                  {data.income.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          {category.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(category.amount)}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary">
                        <div
                          className="h-2 rounded-full bg-emerald-500"
                          style={{
                            width: `${
                              (category.amount / data.incomeTotal) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex h-[220px] items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">No income data</p>
                  <p className="text-sm text-muted-foreground">
                    Add income to see your breakdown
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
