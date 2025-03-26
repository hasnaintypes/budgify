import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    avatar: v.optional(v.string()),
    isPro: v.boolean(),
    currency: v.optional(v.string()),
    clerkId: v.string(),
  }).index("byClerkId", ["clerkId"]),
});
