"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";

export type BudgetCategory = {
  _id: Id<"budgetCategories">;
  name: string;
  categoryId: Id<"categories">;
  categoryName: string;
  budgeted: number;
  spent: number;
  accountId: Id<"accounts">;
  color: string;
  icon: string;
  budgetId: Id<"budgets">;
  userId: Id<"users">;
};

export type Budget = {
  _id: Id<"budgets">;
  accountId: Id<"accounts">;
  month: string; // Format: "YYYY-MM"
  totalBudgeted: number;
  totalSpent: number;
  userId: Id<"users">;
  categories: BudgetCategory[];
};

export function useBudgets(accountId?: Id<"accounts">) {
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);

  // Get user ID from Clerk
  const user = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : "skip"
  );

  // Get all budgets for the user
  const allBudgets = useQuery(
    api.budgets.getAllBudgets,
    user?._id ? { userId: user._id } : "skip"
  );

  // Get budgets for a specific account
  const accountBudgets = useQuery(
    api.budgets.getBudgetsByAccount,
    user?._id && accountId ? { userId: user._id, accountId } : "skip"
  );

  // Get current budget for an account
  const currentAccountBudget = useQuery(
    api.budgets.getCurrentBudget,
    user?._id && accountId ? { userId: user._id, accountId } : "skip"
  );

  // Mutations
  const createBudgetMutation = useMutation(api.budgets.createBudget);
  const updateBudgetMutation = useMutation(api.budgets.updateBudget);
  const deleteBudgetMutation = useMutation(api.budgets.deleteBudget);
  const addBudgetCategoryMutation = useMutation(api.budgets.addBudgetCategory);
  const updateBudgetCategoryMutation = useMutation(
    api.budgets.updateBudgetCategory
  );
  const deleteBudgetCategoryMutation = useMutation(
    api.budgets.deleteBudgetCategory
  );

  useEffect(() => {
    if (!user?._id) return;

    if (accountId) {
      // If we have account budgets data
      if (accountBudgets) {
        setBudgets(accountBudgets);
        setCurrentBudget(currentAccountBudget || accountBudgets[0] || null);
        setIsLoading(false);
      }
    } else {
      // If we have all budgets data
      if (allBudgets) {
        setBudgets(allBudgets);
        setCurrentBudget(null);
        setIsLoading(false);
      }
    }
  }, [user?._id, accountId, allBudgets, accountBudgets, currentAccountBudget]);

  const addBudget = async (
    budget: Omit<Budget, "_id" | "userId" | "categories">
  ) => {
    if (!user?._id) return null;

    try {
      const budgetId = await createBudgetMutation({
        ...budget,
        userId: user._id,
      });

      // Optimistically update the UI
      const newBudget = {
        _id: budgetId,
        ...budget,
        userId: user._id,
        categories: [],
      };

      setBudgets((prev) => [...prev, newBudget]);
      return newBudget;
    } catch (error) {
      console.error("Failed to create budget:", error);
      return null;
    }
  };

  const updateBudget = async (
    id: Id<"budgets">,
    updates: Partial<Omit<Budget, "_id" | "userId" | "categories">>
  ) => {
    try {
      await updateBudgetMutation({
        budgetId: id,
        ...updates,
      });

      // Optimistically update the UI
      setBudgets((prev) =>
        prev.map((budget) =>
          budget._id === id ? { ...budget, ...updates } : budget
        )
      );

      if (currentBudget?._id === id) {
        setCurrentBudget((prev) => (prev ? { ...prev, ...updates } : null));
      }
    } catch (error) {
      console.error("Failed to update budget:", error);
    }
  };

  const deleteBudget = async (id: Id<"budgets">) => {
    try {
      await deleteBudgetMutation({ budgetId: id });

      // Optimistically update the UI
      setBudgets((prev) => prev.filter((budget) => budget._id !== id));

      if (currentBudget?._id === id) {
        setCurrentBudget(null);
      }
    } catch (error) {
      console.error("Failed to delete budget:", error);
    }
  };

  const addBudgetCategory = async (
    budgetId: Id<"budgets">,
    category: Omit<BudgetCategory, "_id" | "userId" | "budgetId">
  ) => {
    if (!user?._id) return null;

    try {
      const categoryId = await addBudgetCategoryMutation({
        ...category,
        budgetId,
        userId: user._id,
      });

      // Optimistically update the UI
      const newCategory = {
        _id: categoryId,
        ...category,
        budgetId,
        userId: user._id,
      };

      setBudgets((prev) =>
        prev.map((budget) => {
          if (budget._id === budgetId) {
            // Add category and update totals
            const updatedBudget = {
              ...budget,
              categories: [...budget.categories, newCategory],
              totalBudgeted: budget.totalBudgeted + category.budgeted,
              totalSpent: budget.totalSpent + category.spent,
            };
            return updatedBudget;
          }
          return budget;
        })
      );

      // Update current budget if it's the one being modified
      if (currentBudget?._id === budgetId) {
        setCurrentBudget((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            categories: [...prev.categories, newCategory],
            totalBudgeted: prev.totalBudgeted + category.budgeted,
            totalSpent: prev.totalSpent + category.spent,
          };
        });
      }

      return newCategory;
    } catch (error) {
      console.error("Failed to add budget category:", error);
      return null;
    }
  };

  const updateBudgetCategory = async (
    budgetId: Id<"budgets">,
    categoryId: Id<"budgetCategories">,
    updates: Partial<Pick<BudgetCategory, "budgeted" | "spent">>
  ) => {
    try {
      await updateBudgetCategoryMutation({
        categoryId,
        ...updates,
      });

      // Find the category to calculate differences
      const budget = budgets.find((b) => b._id === budgetId);
      const category = budget?.categories.find((c) => c._id === categoryId);

      if (!budget || !category) return;

      // Calculate differences for budget totals
      const budgetedDiff =
        updates.budgeted !== undefined
          ? updates.budgeted - category.budgeted
          : 0;
      const spentDiff =
        updates.spent !== undefined ? updates.spent - category.spent : 0;

      // Optimistically update the UI
      setBudgets((prev) =>
        prev.map((budget) => {
          if (budget._id === budgetId) {
            const updatedCategories = budget.categories.map((cat) =>
              cat._id === categoryId ? { ...cat, ...updates } : cat
            );

            return {
              ...budget,
              categories: updatedCategories,
              totalBudgeted: budget.totalBudgeted + budgetedDiff,
              totalSpent: budget.totalSpent + spentDiff,
            };
          }
          return budget;
        })
      );

      // Update current budget if it's the one being modified
      if (currentBudget?._id === budgetId) {
        setCurrentBudget((prev) => {
          if (!prev) return null;

          const updatedCategories = prev.categories.map((cat) =>
            cat._id === categoryId ? { ...cat, ...updates } : cat
          );

          return {
            ...prev,
            categories: updatedCategories,
            totalBudgeted: prev.totalBudgeted + budgetedDiff,
            totalSpent: prev.totalSpent + spentDiff,
          };
        });
      }
    } catch (error) {
      console.error("Failed to update budget category:", error);
    }
  };

  const deleteBudgetCategory = async (
    budgetId: Id<"budgets">,
    categoryId: Id<"budgetCategories">
  ) => {
    try {
      // Find the category to calculate differences
      const budget = budgets.find((b) => b._id === budgetId);
      const category = budget?.categories.find((c) => c._id === categoryId);

      if (!budget || !category) return;

      await deleteBudgetCategoryMutation({ categoryId });

      // Optimistically update the UI
      setBudgets((prev) =>
        prev.map((budget) => {
          if (budget._id === budgetId) {
            return {
              ...budget,
              categories: budget.categories.filter(
                (cat) => cat._id !== categoryId
              ),
              totalBudgeted: budget.totalBudgeted - category.budgeted,
              totalSpent: budget.totalSpent - category.spent,
            };
          }
          return budget;
        })
      );

      // Update current budget if it's the one being modified
      if (currentBudget?._id === budgetId) {
        setCurrentBudget((prev) => {
          if (!prev) return null;

          return {
            ...prev,
            categories: prev.categories.filter((cat) => cat._id !== categoryId),
            totalBudgeted: prev.totalBudgeted - category.budgeted,
            totalSpent: prev.totalSpent - category.spent,
          };
        });
      }
    } catch (error) {
      console.error("Failed to delete budget category:", error);
    }
  };

  return {
    budgets,
    currentBudget,
    isLoading,
    addBudget,
    updateBudget,
    deleteBudget,
    addBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
  };
}
