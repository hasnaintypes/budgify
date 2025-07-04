import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const createTransaction = mutation({
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
    date: v.number(),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    receipt: v.optional(v.string()),
    // Recurring transaction fields
    isRecurring: v.optional(v.boolean()),
    frequency: v.optional(
      v.union(
        v.literal("DAILY"),
        v.literal("WEEKLY"),
        v.literal("MONTHLY"),
        v.literal("YEARLY")
      )
    ),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get the category
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    // If this is a recurring transaction, create the recurring template first
    if (args.isRecurring && args.frequency) {
      const recurringId = await ctx.db.insert("recurringTransactions", {
        description: args.description,
        amount: args.amount,
        type: args.type,
        categoryId: args.categoryId,
        categoryName: category.name,
        accountId: args.accountId,
        userId: args.userId,
        paymentMethod: args.paymentMethod,
        frequency: args.frequency,
        nextDueDate: calculateNextDueDate(args.date, args.frequency),
        startDate: args.date,
        endDate: args.endDate,
        location: args.location,
        notes: args.notes,
        receipt: args.receipt,
        isActive: true,
      });

      // Schedule the next recurring transaction
      const nextDueDate = calculateNextDueDate(args.date, args.frequency);
      const timeDiff = nextDueDate - Date.now();
      if (timeDiff > 0) {
        await ctx.scheduler.runAfter(
          timeDiff,
          api.recurringTransactions.processRecurringTransaction,
          {
            recurringId,
          }
        );
      }

      // Create the initial transaction with recurring reference
      const transactionId = await ctx.db.insert("transactions", {
        description: args.description,
        amount: args.amount,
        type: args.type,
        categoryId: args.categoryId,
        categoryName: category.name,
        accountId: args.accountId,
        userId: args.userId,
        paymentMethod: args.paymentMethod,
        date: args.date,
        location: args.location,
        notes: args.notes,
        receipt: args.receipt,
        isRecurring: true,
        recurringId: recurringId,
      });

      // Update budget if this is an expense
      if (args.type === "expense") {
        await updateBudgetForTransaction(ctx, args, category);
      }

      return transactionId;
    }

    // Regular one-time transaction
    const transactionId = await ctx.db.insert("transactions", {
      description: args.description,
      amount: args.amount,
      type: args.type,
      categoryId: args.categoryId,
      categoryName: category.name,
      accountId: args.accountId,
      userId: args.userId,
      paymentMethod: args.paymentMethod,
      date: args.date,
      location: args.location,
      notes: args.notes,
      receipt: args.receipt,
      isRecurring: false,
    });

    // Update budget if this is an expense
    if (args.type === "expense") {
      await updateBudgetForTransaction(ctx, args, category);
    }

    return transactionId;
  },
});

// Helper function to update budget
async function updateBudgetForTransaction(ctx: any, args: any, category: any) {
  const transactionDate = new Date(args.date);
  const month = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, "0")}`;

  const budget = await ctx.db
    .query("budgets")
    .withIndex(
      "byUserAndAccount",
      (q: {
        eq: (
          arg0: string,
          arg1: any
        ) => {
          (): any;
          new (): any;
          eq: { (arg0: string, arg1: any): any; new (): any };
        };
      }) => q.eq("userId", args.userId).eq("accountId", args.accountId)
    )
    .filter(
      (q: {
        eq: (arg0: any, arg1: string) => any;
        field: (arg0: string) => any;
      }) => q.eq(q.field("month"), month)
    )
    .first();

  if (budget) {
    const budgetCategory = await ctx.db
      .query("budgetCategories")
      .withIndex("byBudget", (q: { eq: (arg0: string, arg1: any) => any }) =>
        q.eq("budgetId", budget._id)
      )
      .filter(
        (q: {
          eq: (arg0: any, arg1: any) => any;
          field: (arg0: string) => any;
        }) => q.eq(q.field("categoryId"), args.categoryId)
      )
      .first();

    if (budgetCategory) {
      const newSpent = budgetCategory.spent + args.amount;
      await ctx.db.patch(budgetCategory._id, {
        spent: newSpent,
      });

      await ctx.db.patch(budget._id, {
        totalSpent: budget.totalSpent + args.amount,
      });
    }
  }
}

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

export const getTransactionsByUser = query({
  args: { userId: v.id("users") },
  handler: async ({ db }, { userId }) => {
    return await db
      .query("transactions")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const updateTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
    updates: v.object({
      description: v.optional(v.string()),
      amount: v.optional(v.number()),
      type: v.optional(v.union(v.literal("income"), v.literal("expense"))),
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
      date: v.optional(v.number()),
      location: v.optional(v.string()),
      notes: v.optional(v.string()),
      receipt: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { transactionId, updates }) => {
    // Get the original transaction to calculate differences
    const originalTransaction = await ctx.db.get(transactionId);
    if (!originalTransaction) {
      throw new Error("Transaction not found");
    }

    let updatedFields = { ...updates };

    // If categoryId is being updated, fetch the new category name
    if (updates.categoryId) {
      const newCategory = await ctx.db.get(updates.categoryId);
      if (!newCategory) {
        throw new Error("New category not found");
      }
      updatedFields = {
        ...(updatedFields as any),
        categoryName: newCategory.name,
      };
    }

    // Update the transaction
    await ctx.db.patch(transactionId, updatedFields);

    // Handle budget updates if this is an expense transaction
    if (originalTransaction.type === "expense") {
      // Calculate amount difference if amount is being updated
      const amountDiff =
        updates.amount !== undefined
          ? updates.amount - originalTransaction.amount
          : 0;

      // Only proceed if there's an amount change or category change
      if (amountDiff !== 0 || updates.categoryId) {
        // Get transaction date (use updated date if provided)
        const transactionDate =
          updates.date !== undefined
            ? new Date(updates.date)
            : new Date(originalTransaction.date);

        const month = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, "0")}`;

        // Get account ID (use updated account if provided)
        const accountId = updates.accountId || originalTransaction.accountId;

        // Find the current budget for this account
        const budget = await ctx.db
          .query("budgets")
          .withIndex("byUserAndAccount", (q) =>
            q
              .eq("userId", originalTransaction.userId)
              .eq("accountId", accountId)
          )
          .filter((q) => q.eq(q.field("month"), month))
          .first();

        if (budget) {
          // If category is changing, update both old and new categories
          if (
            updates.categoryId &&
            updates.categoryId !== originalTransaction.categoryId
          ) {
            // Update old category (reduce spent amount)
            const oldBudgetCategory = await ctx.db
              .query("budgetCategories")
              .withIndex("byBudget", (q) => q.eq("budgetId", budget._id))
              .filter((q) =>
                q.eq(q.field("categoryId"), originalTransaction.categoryId)
              )
              .first();

            if (oldBudgetCategory) {
              await ctx.db.patch(oldBudgetCategory._id, {
                spent: oldBudgetCategory.spent - originalTransaction.amount,
              });
            }

            // Update new category (increase spent amount)
            const newBudgetCategory = await ctx.db
              .query("budgetCategories")
              .withIndex("byBudget", (q) => q.eq("budgetId", budget._id))
              .filter((q) => q.eq(q.field("categoryId"), updates.categoryId))
              .first();

            if (newBudgetCategory) {
              const newAmount =
                updates.amount !== undefined
                  ? updates.amount
                  : originalTransaction.amount;
              await ctx.db.patch(newBudgetCategory._id, {
                spent: newBudgetCategory.spent + newAmount,
              });
            }

            // Update budget total (only the difference matters)
            if (amountDiff !== 0) {
              await ctx.db.patch(budget._id, {
                totalSpent: budget.totalSpent + amountDiff,
              });
            }
          }
          // If only amount is changing, update the category and budget
          else if (amountDiff !== 0) {
            // Update category spent amount
            const budgetCategory = await ctx.db
              .query("budgetCategories")
              .withIndex("byBudget", (q) => q.eq("budgetId", budget._id))
              .filter((q) =>
                q.eq(q.field("categoryId"), originalTransaction.categoryId)
              )
              .first();

            if (budgetCategory) {
              await ctx.db.patch(budgetCategory._id, {
                spent: budgetCategory.spent + amountDiff,
              });
            }

            // Update budget total
            await ctx.db.patch(budget._id, {
              totalSpent: budget.totalSpent + amountDiff,
            });
          }
        }
      }
    }

    return transactionId;
  },
});

export const deleteTransaction = mutation({
  args: { transactionId: v.id("transactions") },
  handler: async (ctx, { transactionId }) => {
    // Get the transaction before deleting it
    const transaction = await ctx.db.get(transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Delete the transaction
    await ctx.db.delete(transactionId);

    // Update budget if this was an expense transaction
    if (transaction.type === "expense") {
      const transactionDate = new Date(transaction.date);
      const month = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, "0")}`;

      // Find the current budget for this account
      const budget = await ctx.db
        .query("budgets")
        .withIndex("byUserAndAccount", (q) =>
          q
            .eq("userId", transaction.userId)
            .eq("accountId", transaction.accountId)
        )
        .filter((q) => q.eq(q.field("month"), month))
        .first();

      if (budget) {
        // Find the budget category
        const budgetCategory = await ctx.db
          .query("budgetCategories")
          .withIndex("byBudget", (q) => q.eq("budgetId", budget._id))
          .filter((q) => q.eq(q.field("categoryId"), transaction.categoryId))
          .first();

        if (budgetCategory) {
          // Update the budget category's spent amount
          await ctx.db.patch(budgetCategory._id, {
            spent: budgetCategory.spent - transaction.amount,
          });

          // Update the budget's total spent amount
          await ctx.db.patch(budget._id, {
            totalSpent: budget.totalSpent - transaction.amount,
          });
        }
      }
    }

    return transactionId;
  },
});

export const getTransactionsByUserAndAccount = query({
  args: { userId: v.id("users"), accountId: v.id("accounts") },
  handler: async ({ db }, { userId, accountId }) => {
    return await db
      .query("transactions")
      .withIndex("byAccount", (q) =>
        q.eq("userId", userId).eq("accountId", accountId)
      )
      .collect();
  },
});

export const getTransactionsByUserAndCategory = query({
  args: { userId: v.id("users"), categoryId: v.id("categories") },
  handler: async ({ db }, { userId, categoryId }) => {
    return await db
      .query("transactions")
      .withIndex("byCategory", (q) =>
        q.eq("userId", userId).eq("categoryId", categoryId)
      )
      .collect();
  },
});
