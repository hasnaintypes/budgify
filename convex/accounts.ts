import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new account
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    balance: v.number(),
    currency: v.string(),
    color: v.string(),
    icon: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const account = await ctx.db.insert("accounts", {
      name: args.name,
      description: args.description,
      balance: args.balance,
      currency: args.currency,
      color: args.color,
      icon: args.icon,
      isActive: true,
      userId: user._id,
    });

    return account;
  },
});

// Update an existing account
export const update = mutation({
  args: {
    id: v.id("accounts"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    balance: v.optional(v.number()),
    currency: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const account = await ctx.db.get(args.id);
    if (!account) {
      throw new Error("Account not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user || account.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const updatedAccount = await ctx.db.patch(args.id, {
      ...args,
    });

    return updatedAccount;
  },
});

// Delete an account
export const remove = mutation({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const account = await ctx.db.get(args.id);
    if (!account) {
      throw new Error("Account not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user || account.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Get all accounts for the current user
export const getAll = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user) {
      return [];
    }

    const accounts = await ctx.db
      .query("accounts")
      .withIndex("byUserId")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    return accounts;
  },
});

// Get active accounts for the current user
export const getActive = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user) {
      return [];
    }

    const accounts = await ctx.db
      .query("accounts")
      .withIndex("byUserIdAndActive")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), user._id),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();

    return accounts;
  },
});

// Get a single account by ID
export const getById = query({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const account = await ctx.db.get(args.id);
    if (!account) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user || account.userId !== user._id) {
      return null;
    }

    return account;
  },
});
