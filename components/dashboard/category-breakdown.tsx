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
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { CategoryItem } from "./category-item";

export function CategoryBreakdown() {
  const { user } = useUser();
  const userId = user?.id;

  // Get the Convex user using getUserByClerkId
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : "skip"
  );
  const convexUserId = convexUser?._id;

  const expenses = useQuery(
    api.categories.getExpenseCategories,
    convexUserId ? { userId: convexUserId } : "skip"
  );
  const income = useQuery(
    api.categories.getIncomeCategories,
    convexUserId ? { userId: convexUserId } : "skip"
  );

  // We'll calculate totals in the render phase using the CategoryItem component
  // This avoids calling hooks in loops which violates React's rules of hooks

  const isLoading = !expenses || !income;

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
            ) : expenses && expenses.length > 0 ? (
              <ScrollArea className="h-[220px] pr-4">
                <div className="space-y-4">
                  {expenses.map((category) => (
                    <CategoryItem
                      key={category._id}
                      clerkId={userId || ""}
                      category={category}
                      total={expenses.reduce((sum, cat) => {
                        // We'll calculate the total here for each render
                        // This is just a placeholder - the actual values will come from CategoryItem
                        return sum;
                      }, 0)}
                      color="bg-rose-500"
                    />
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
            ) : income && income.length > 0 ? (
              <ScrollArea className="h-[220px] pr-4">
                <div className="space-y-4">
                  {income.map((category) => (
                    <CategoryItem
                      key={category._id}
                      clerkId={userId || ""}
                      category={category}
                      total={income.reduce((sum, cat) => {
                        // We'll calculate the total here for each render
                        // This is just a placeholder - the actual values will come from CategoryItem
                        return sum;
                      }, 0)}
                      color="bg-emerald-500"
                    />
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
