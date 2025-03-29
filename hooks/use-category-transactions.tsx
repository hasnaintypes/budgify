"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Hook to get transaction amounts by category
 * @param clerkId - The user's Clerk ID
 * @param categoryId - The category ID to filter transactions by
 * @returns An object containing the total amount and transaction data
 */
export function useCategoryTransactions({
  clerkId,
  categoryId,
}: {
  clerkId: string;
  categoryId: Id<"categories">;
}) {
  const user = useQuery(
    api.users.getUserByClerkId,
    clerkId ? { clerkId } : "skip"
  );

  const category = useQuery(
    api.categories.getCategoryById,
    categoryId ? { categoryId } : "skip"
  );

  const transactions = useQuery(
    api.transactions.getTransactionsByUserAndCategory,
    user && categoryId ? { userId: user._id, categoryId } : "skip"
  );

  const isLoading =
    (clerkId && user === undefined) ||
    (categoryId && category === undefined) ||
    transactions === undefined;

  // Calculate total amount for the category
  const totalAmount = transactions
    ? transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
    : 0;

  // Sort transactions by date (newest first)
  const sortedTransactions = transactions
    ? [...transactions].sort((a, b) => b.date - a.date)
    : [];

  return {
    data: sortedTransactions,
    totalAmount,
    category,
    isLoading,
  };
}
