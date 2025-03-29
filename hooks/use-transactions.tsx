"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function useTransactions({
  limit,
  clerkId,
}: {
  limit?: number;
  clerkId: string;
}) {
  const user = useQuery(api.users.getUserByClerkId, { clerkId });
  const transactions = useQuery(api.transactions.getTransactionsByUser, 
    user ? { userId: user._id } : "skip"
  );
  const isLoading =
    (clerkId && user === undefined) || transactions === undefined;

  let data = transactions;

  if (data && limit) {
    // Sort by date (newest first) and apply limit
    data = [...data].sort((a, b) => b.date - a.date).slice(0, limit);
  }

  return { data, isLoading };
}

export function useTransactionsByCategory({
  clerkId,
  categoryId,
  limit,
}: {
  clerkId: string;
  categoryId: Id<"categories">;
  limit?: number;
}) {
  const user = clerkId
    ? useQuery(api.users.getUserByClerkId, { clerkId })
    : null;
  const transactions = useQuery(
    api.transactions.getTransactionsByUserAndCategory,
    user && categoryId ? { userId: user._id, categoryId } : "skip"
  );
  const isLoading =
    (clerkId && user === undefined) || transactions === undefined;

  let data = transactions;

  if (data && limit) {
    // Sort by date (newest first) and apply limit
    data = [...data].sort((a, b) => b.date - a.date).slice(0, limit);
  }

  return { data, isLoading };
}