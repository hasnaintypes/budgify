"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function useRecurringTransactions(userId: Id<"users"> | null) {
  const recurringTransactions = useQuery(
    api.recurringTransactions.getRecurringTransactions,
    userId ? { userId } : "skip"
  );

  const activeRecurringTransactions = useQuery(
    api.recurringTransactions.getActiveRecurringTransactions,
    userId ? { userId } : "skip"
  );

  const createRecurringTransaction = useMutation(
    api.recurringTransactions.createRecurringTransaction
  );
  const updateRecurringTransaction = useMutation(
    api.recurringTransactions.updateRecurringTransaction
  );
  const deleteRecurringTransaction = useMutation(
    api.recurringTransactions.deleteRecurringTransaction
  );
  const pauseRecurringTransaction = useMutation(
    api.recurringTransactions.pauseRecurringTransaction
  );
  const resumeRecurringTransaction = useMutation(
    api.recurringTransactions.resumeRecurringTransaction
  );

  const isLoading = userId && recurringTransactions === undefined;

  return {
    recurringTransactions,
    activeRecurringTransactions,
    isLoading,
    createRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    pauseRecurringTransaction,
    resumeRecurringTransaction,
  };
}

export type RecurringTransaction = {
  _id: Id<"recurringTransactions">;
  description: string;
  amount: number;
  type: "income" | "expense";
  categoryId: Id<"categories">;
  categoryName: string;
  accountId: Id<"accounts">;
  userId: Id<"users">;
  paymentMethod:
    | "CASH"
    | "CREDIT_CARD"
    | "DEBIT_CARD"
    | "BANK_TRANSFER"
    | "MOBILE_PAYMENT"
    | "OTHER";
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  nextDueDate: number;
  startDate: number;
  endDate?: number;
  location?: string;
  notes?: string;
  receipt?: string;
  isActive: boolean;
  lastProcessed?: number;
  _creationTime: number;
};
