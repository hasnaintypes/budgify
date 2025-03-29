import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ✅ Create a new category
export const createCategory = mutation({
  args: {
    name: v.string(),
    icon: v.string(),
    color: v.string(),
    type: v.union(v.literal("income"), v.literal("expense")),
    userId: v.id("users"),
  },
  handler: async (ctx, { name, icon, color, type, userId }) => {
    return await ctx.db.insert("categories", {
      name,
      icon,
      color,
      type,
      userId,
    });
  },
});

// ✅ Update an existing category
export const updateCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    type: v.optional(v.union(v.literal("income"), v.literal("expense"))),
  },
  handler: async (ctx, { categoryId, ...updates }) => {
    await ctx.db.patch(categoryId, updates);
  },
});

// ✅ Delete a category
export const deleteCategory = mutation({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, { categoryId }) => {
    await ctx.db.delete(categoryId);
  },
});

// / ✅ Get all categories for a user
export const getAllCategories = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("categories")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .collect();
  },
});

// ✅ Get only income categories
export const getIncomeCategories = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("categories")
      .withIndex("byUserIdAndType", (q) =>
        q.eq("userId", userId).eq("type", "income")
      )
      .collect();
  },
});

// ✅ Get only expense categories
export const getExpenseCategories = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("categories")
      .withIndex("byUserIdAndType", (q) =>
        q.eq("userId", userId).eq("type", "expense")
      )
      .collect();
  },
});

// ✅ Get category by ID
export const getCategoryById = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, { categoryId }) => {
    return await ctx.db.get(categoryId);
  },
});
