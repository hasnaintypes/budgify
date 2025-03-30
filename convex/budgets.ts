import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all budgets for a user
export const getAllBudgets = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const budgets = await ctx.db
      .query("budgets")
      .withIndex("byUserId", (q) => q.eq("userId", args.userId))
      .collect();

    // For each budget, get its categories
    const budgetsWithCategories = await Promise.all(
      budgets.map(async (budget) => {
        const categories = await ctx.db
          .query("budgetCategories")
          .withIndex("byBudget", (q) => q.eq("budgetId", budget._id))
          .collect();

        return {
          ...budget,
          categories,
        };
      })
    );

    return budgetsWithCategories;
  },
});

// Get budgets for a specific account
export const getBudgetsByAccount = query({
  args: { userId: v.id("users"), accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    const budgets = await ctx.db
      .query("budgets")
      .withIndex("byUserAndAccount", (q) =>
        q.eq("userId", args.userId).eq("accountId", args.accountId)
      )
      .collect();

    // For each budget, get its categories
    const budgetsWithCategories = await Promise.all(
      budgets.map(async (budget) => {
        const categories = await ctx.db
          .query("budgetCategories")
          .withIndex("byBudget", (q) => q.eq("budgetId", budget._id))
          .collect();

        return {
          ...budget,
          categories,
        };
      })
    );

    return budgetsWithCategories;
  },
});

// Get current month's budget for an account
export const getCurrentBudget = query({
  args: { userId: v.id("users"), accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    // Get current month in YYYY-MM format
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const budget = await ctx.db
      .query("budgets")
      .withIndex("byUserAndAccount", (q) =>
        q.eq("userId", args.userId).eq("accountId", args.accountId)
      )
      .filter((q) => q.eq(q.field("month"), currentMonth))
      .first();

    if (!budget) return null;

    // Get budget categories
    const categories = await ctx.db
      .query("budgetCategories")
      .withIndex("byBudget", (q) => q.eq("budgetId", budget._id))
      .collect();

    return {
      ...budget,
      categories,
    };
  },
});

// Create a new budget
export const createBudget = mutation({
  args: {
    month: v.string(),
    accountId: v.id("accounts"),
    totalBudgeted: v.number(),
    totalSpent: v.number(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const budgetId = await ctx.db.insert("budgets", {
      month: args.month,
      accountId: args.accountId,
      totalBudgeted: args.totalBudgeted,
      totalSpent: args.totalSpent,
      userId: args.userId,
    });

    return budgetId;
  },
});

// Update an existing budget
export const updateBudget = mutation({
  args: {
    budgetId: v.id("budgets"),
    totalBudgeted: v.optional(v.number()),
    totalSpent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { budgetId, ...updates } = args;

    // Only include fields that are provided
    const updateFields: Record<string, any> = {};
    if (updates.totalBudgeted !== undefined)
      updateFields.totalBudgeted = updates.totalBudgeted;
    if (updates.totalSpent !== undefined)
      updateFields.totalSpent = updates.totalSpent;

    await ctx.db.patch(budgetId, updateFields);
    return budgetId;
  },
});

// Delete a budget and its categories
export const deleteBudget = mutation({
  args: { budgetId: v.id("budgets") },
  handler: async (ctx, args) => {
    // First delete all budget categories
    const categories = await ctx.db
      .query("budgetCategories")
      .withIndex("byBudget", (q) => q.eq("budgetId", args.budgetId))
      .collect();

    for (const category of categories) {
      await ctx.db.delete(category._id);
    }

    // Then delete the budget
    await ctx.db.delete(args.budgetId);
    return args.budgetId;
  },
});

// Add a category to a budget
export const addBudgetCategory = mutation({
  args: {
    budgetId: v.id("budgets"),
    name: v.string(),
    categoryId: v.id("categories"),
    categoryName: v.string(),
    budgeted: v.number(),
    spent: v.number(),
    accountId: v.id("accounts"),
    color: v.string(),
    icon: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Add the category
    const categoryId = await ctx.db.insert("budgetCategories", {
      name: args.name,
      categoryId: args.categoryId,
      categoryName: args.categoryName,
      budgeted: args.budgeted,
      spent: args.spent,
      accountId: args.accountId,
      color: args.color,
      icon: args.icon,
      budgetId: args.budgetId,
      userId: args.userId,
    });

    // Update the budget totals
    const budget = await ctx.db.get(args.budgetId);
    if (budget) {
      await ctx.db.patch(args.budgetId, {
        totalBudgeted: budget.totalBudgeted + args.budgeted,
        totalSpent: budget.totalSpent + args.spent,
      });
    }

    return categoryId;
  },
});

// Update a budget category
export const updateBudgetCategory = mutation({
  args: {
    categoryId: v.id("budgetCategories"),
    budgeted: v.optional(v.number()),
    spent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { categoryId, ...updates } = args;

    // Get the current category to calculate differences
    const category = await ctx.db.get(categoryId);
    if (!category) throw new Error("Budget category not found");

    // Calculate differences for budget totals
    let budgetedDiff = 0;
    let spentDiff = 0;

    // Only include fields that are provided
    const updateFields: Record<string, any> = {};
    if (updates.budgeted !== undefined) {
      updateFields.budgeted = updates.budgeted;
      budgetedDiff = updates.budgeted - category.budgeted;
    }
    if (updates.spent !== undefined) {
      updateFields.spent = updates.spent;
      spentDiff = updates.spent - category.spent;
    }

    // Update the category
    await ctx.db.patch(categoryId, updateFields);

    // Update the budget totals if there are changes
    if (budgetedDiff !== 0 || spentDiff !== 0) {
      const budget = await ctx.db.get(category.budgetId);
      if (budget) {
        await ctx.db.patch(category.budgetId, {
          totalBudgeted: budget.totalBudgeted + budgetedDiff,
          totalSpent: budget.totalSpent + spentDiff,
        });
      }
    }

    return categoryId;
  },
});

// Delete a budget category
export const deleteBudgetCategory = mutation({
  args: { categoryId: v.id("budgetCategories") },
  handler: async (ctx, args) => {
    // Get the category to update budget totals
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Budget category not found");

    // Delete the category
    await ctx.db.delete(args.categoryId);

    // Update the budget totals
    const budget = await ctx.db.get(category.budgetId);
    if (budget) {
      await ctx.db.patch(category.budgetId, {
        totalBudgeted: budget.totalBudgeted - category.budgeted,
        totalSpent: budget.totalSpent - category.spent,
      });
    }

    return args.categoryId;
  },
});

// Get all budget categories
export const getAllBudgetCategories = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("budgetCategories")
      .withIndex("byUserId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});
