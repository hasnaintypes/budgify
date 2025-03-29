import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

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
  },
  handler: async ({ db }, args) => {
    const category = await db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }
    return await db.insert("transactions", {
      ...args,
      categoryName: category.name,
    });
  },
});

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
  handler: async ({ db }, { transactionId, updates }) => {
    let updatedFields = { ...updates };

    // If categoryId is being updated, fetch the new category name
    if (updates.categoryId) {
      const newCategory = await db.get(updates.categoryId);
      if (!newCategory) {
        throw new Error("New category not found");
      }
      updatedFields = {
        ...(updatedFields as any),
        categoryName: newCategory.name,
      };
    }

    return await db.patch(transactionId, updatedFields);
  },
});

export const deleteTransaction = mutation({
  args: { transactionId: v.id("transactions") },
  handler: async ({ db }, { transactionId }) => {
    return await db.delete(transactionId);
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
