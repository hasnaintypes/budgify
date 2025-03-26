import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    avatar: v.optional(v.string()),
    isPro: v.boolean(),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("Syncing user with Clerk ID:", args.clerkId);

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      console.log("User already exists, updating...");

      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        avatar: args.avatar,
        isPro: args.isPro,
        currency: args.currency,
      });

      console.log("User updated successfully.");
      return existingUser._id;
    }

    // Create new user
    console.log("Creating new user...");
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      avatar: args.avatar,
      isPro: args.isPro,
      currency: args.currency,
    });

    console.log("New user created successfully with ID:", userId);
    return userId;
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    console.log("Fetching user with Clerk ID:", args.clerkId);

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      console.log("User not found.");
      return null;
    }

    console.log("User found:", user);
    return user;
  },
});
