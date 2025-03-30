"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type Period = "current" | "previous" | "last3" | "last6" | "year" | "all";

/**
 * Hook to get transaction data for a specific account
 * @param clerkId - The user's Clerk ID
 * @param accountId - The account ID to filter transactions by
 * @param period - The time period to filter transactions (defaults to current month)
 * @returns An object containing income, expenses, and transaction data
 */
export function useAccountTransactions({
  clerkId,
  accountId,
  period = "current",
}: {
  clerkId: string;
  accountId: Id<"accounts">;
  period?: Period;
}) {
  const user = useQuery(
    api.users.getUserByClerkId,
    clerkId ? { clerkId } : "skip"
  );

  const transactions = useQuery(
    api.transactions.getTransactionsByUserAndAccount,
    user && accountId ? { userId: user._id, accountId } : "skip"
  );

  const isLoading =
    (clerkId && user === undefined) ||
    (accountId && transactions === undefined);

  // Filter transactions based on selected period
  const filteredTransactions = transactions
    ? filterTransactionsByPeriod(transactions, period)
    : [];

  // Calculate income (sum of all income transactions)
  const income = filteredTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  // Calculate expenses (sum of all expense transactions)
  const expenses = filteredTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => b.date - a.date
  );

  return {
    data: sortedTransactions,
    income,
    expenses,
    isLoading,
  };
}

/**
 * Filter transactions based on time period
 */
function filterTransactionsByPeriod(transactions: any[], period: Period) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Start of current month
  const startOfCurrentMonth = new Date(currentYear, currentMonth, 1).getTime();

  // End of current month
  const endOfCurrentMonth = new Date(
    currentYear,
    currentMonth + 1,
    0,
    23,
    59,
    59,
    999
  ).getTime();

  switch (period) {
    case "current":
      // Current month
      return transactions.filter(
        (t) => t.date >= startOfCurrentMonth && t.date <= endOfCurrentMonth
      );

    case "previous":
      // Previous month
      const startOfPreviousMonth = new Date(
        currentYear,
        currentMonth - 1,
        1
      ).getTime();
      const endOfPreviousMonth = new Date(
        currentYear,
        currentMonth,
        0,
        23,
        59,
        59,
        999
      ).getTime();
      return transactions.filter(
        (t) => t.date >= startOfPreviousMonth && t.date <= endOfPreviousMonth
      );

    case "last3":
      // Last 3 months
      const startOfLast3Months = new Date(
        currentYear,
        currentMonth - 2,
        1
      ).getTime();
      return transactions.filter(
        (t) => t.date >= startOfLast3Months && t.date <= endOfCurrentMonth
      );

    case "last6":
      // Last 6 months
      const startOfLast6Months = new Date(
        currentYear,
        currentMonth - 5,
        1
      ).getTime();
      return transactions.filter(
        (t) => t.date >= startOfLast6Months && t.date <= endOfCurrentMonth
      );

    case "year":
      // Current year
      const startOfYear = new Date(currentYear, 0, 1).getTime();
      const endOfYear = new Date(
        currentYear,
        11,
        31,
        23,
        59,
        59,
        999
      ).getTime();
      return transactions.filter(
        (t) => t.date >= startOfYear && t.date <= endOfYear
      );

    case "all":
      // All time
      return transactions;

    default:
      return transactions;
  }
}
