import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const createRecurringTransaction = mutation({
  args: {
    description: v.string(),
    amount: v.number(),
    type: v.union(v.literal("income"), v.literal("expense")),
    categoryId: v.id("categories"),
    accountId: v.id("accounts"),
    userId: v.id("users"),
    paymentMethod: v.union(
      v.literal("CASH"),
      v.literal("CREDIT_CARD"),
      v.literal("DEBIT_CARD"),
      v.literal("BANK_TRANSFER"),
      v.literal("MOBILE_PAYMENT"),
      v.literal("OTHER")
    ),
    frequency: v.union(
      v.literal("DAILY"),
      v.literal("WEEKLY"),
      v.literal("MONTHLY"),
      v.literal("YEARLY")
    ),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    receipt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the category to store the name
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    // Calculate next due date based on frequency
    const nextDueDate = calculateNextDueDate(args.startDate, args.frequency);

    // Create the recurring transaction
    const recurringId = await ctx.db.insert("recurringTransactions", {
      ...args,
      categoryName: category.name,
      nextDueDate,
      isActive: true,
    });

    // Create the initial transaction
    await ctx.scheduler.runAfter(
      0,
      api.recurringTransactions.processRecurringTransaction,
      {
        recurringId,
      }
    );

    return recurringId;
  },
});

export const getRecurringTransactions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("recurringTransactions")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getActiveRecurringTransactions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const recurringTransactions = await ctx.db
      .query("recurringTransactions")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .collect();

    return recurringTransactions;
 },
});

export const updateRecurringTransaction = mutation({
  args: {
    recurringId: v.id("recurringTransactions"),
    updates: v.object({
      description: v.optional(v.string()),
      amount: v.optional(v.number()),
      categoryId: v.optional(v.id("categories")),
      accountId: v.optional(v.id("accounts")),
      paymentMethod: v.optional(
        v.union(
          v.literal("CASH"),
          v.literal("CREDIT_CARD"),
          v.literal("DEBIT_CARD"),
          v.literal("BANK_TRANSFER"),
          v.literal("MOBILE_PAYMENT"),
          v.literal("OTHER")
        )
      ),
      frequency: v.optional(
        v.union(
          v.literal("DAILY"),
          v.literal("WEEKLY"),
          v.literal("MONTHLY"),
          v.literal("YEARLY")
        )
      ),
      endDate: v.optional(v.number()),
      location: v.optional(v.string()),
      notes: v.optional(v.string()),
      receipt: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { recurringId, updates }) => {
    const recurring = await ctx.db.get(recurringId);
    if (!recurring) {
      throw new Error("Recurring transaction not found");
    }

    // Type updatedFields to allow computed properties
    let updatedFields: any = { ...updates };

    // If categoryId is being updated, fetch the new category name
    if (updates.categoryId) {
      const newCategory = await ctx.db.get(updates.categoryId);
      if (!newCategory) {
        throw new Error("New category not found");
      }
      updatedFields = {
        ...updatedFields,
        categoryName: newCategory.name,
      };
    }

    // If frequency is being updated, recalculate next due date
    if (updates.frequency) {
      const nextDueDate = calculateNextDueDate(
        recurring.nextDueDate,
        updates.frequency
      );
      updatedFields = {
        ...updatedFields,
        nextDueDate,
      };
    }

    await ctx.db.patch(recurringId, updatedFields);
  },
});

export const deleteRecurringTransaction = mutation({
  args: { recurringId: v.id("recurringTransactions") },
  handler: async (ctx, { recurringId }) => {
    await ctx.db.delete(recurringId);
  },
});

export const pauseRecurringTransaction = mutation({
  args: { recurringId: v.id("recurringTransactions") },
  handler: async (ctx, { recurringId }) => {
    await ctx.db.patch(recurringId, { isActive: false });
  },
});

export const resumeRecurringTransaction = mutation({
  args: { recurringId: v.id("recurringTransactions") },
  handler: async (ctx, { recurringId }) => {
    const recurring = await ctx.db.get(recurringId);
    if (!recurring) {
      throw new Error("Recurring transaction not found");
    }

    // Recalculate next due date from current date
    const nextDueDate = calculateNextDueDate(Date.now(), recurring.frequency);

    await ctx.db.patch(recurringId, {
      isActive: true,
      nextDueDate,
    });
  },
});

export const processRecurringTransaction = mutation({
  args: { recurringId: v.id("recurringTransactions") },
  handler: async (ctx, { recurringId }) => {
    const recurring = await ctx.db.get(recurringId);
    if (!recurring || !recurring.isActive) {
      return;
    }

    const now = Date.now();

    // Check if it's time to process this recurring transaction
    if (recurring.nextDueDate > now) {
      return;
    }

    // Check if end date has passed
    if (recurring.endDate && now > recurring.endDate) {
      await ctx.db.patch(recurringId, { isActive: false });
      return;
    }

    // Create the transaction
    await ctx.db.insert("transactions", {
      description: recurring.description,
      amount: recurring.amount,
      type: recurring.type,
      categoryId: recurring.categoryId,
      categoryName: recurring.categoryName,
      accountId: recurring.accountId,
      userId: recurring.userId,
      paymentMethod: recurring.paymentMethod,
      date: now,
      location: recurring.location,
      notes: recurring.notes,
      receipt: recurring.receipt,
      isRecurring: true,
      recurringId: recurringId,
    });

    // Update budget for expense transactions
    if (recurring.type === "expense") {
      const transactionDate = new Date(now);
      const month = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, "0")}`;

      const budget = await ctx.db
        .query("budgets")
        .withIndex("byUserAndAccount", (q) =>
          q.eq("userId", recurring.userId).eq("accountId", recurring.accountId)
        )
        .filter((q) => q.eq(q.field("month"), month))
        .first();

      if (budget) {
        const budgetCategory = await ctx.db
          .query("budgetCategories")
          .withIndex("byBudget", (q) => q.eq("budgetId", budget._id))
          .filter((q) => q.eq(q.field("categoryId"), recurring.categoryId))
          .first();

        if (budgetCategory) {
          await ctx.db.patch(budgetCategory._id, {
            spent: budgetCategory.spent + recurring.amount,
          });

          await ctx.db.patch(budget._id, {
            totalSpent: budget.totalSpent + recurring.amount,
          });
        }
      }
    }

    // Calculate next due date
    const nextDueDate = calculateNextDueDate(
      recurring.nextDueDate,
      recurring.frequency
    );

    // Update the recurring transaction
    await ctx.db.patch(recurringId, {
      nextDueDate,
      lastProcessed: now,
    });

    // Schedule the next processing
    const timeDiff = nextDueDate - now;
    if (timeDiff > 0) {
      await ctx.scheduler.runAfter(
        timeDiff,
        api.recurringTransactions.processRecurringTransaction,
        {
          recurringId,
        }
      );
    }
  },
});

export const processDueRecurringTransactions = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get all active recurring transactions that are due
    const dueTransactions = await ctx.db
      .query("recurringTransactions")
      .withIndex("byActive", (q) => q.eq("isActive", true))
      .filter((q) => q.lte(q.field("nextDueDate"), now))
      .collect();

    // Process each due transaction
    for (const recurring of dueTransactions) {
      await ctx.scheduler.runAfter(
        0,
        api.recurringTransactions.processRecurringTransaction,
        {
          recurringId: recurring._id,
        }
      );
    }

    return { processed: dueTransactions.length };
  },
});

// Helper function to calculate next due date
function calculateNextDueDate(currentDate: number, frequency: string): number {
  const date = new Date(currentDate);

  switch (frequency) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      throw new Error(`Invalid frequency: ${frequency}`);
  }

  return date.getTime();
}
