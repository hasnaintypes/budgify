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

  categories: defineTable({
    name: v.string(),
    icon: v.string(),
    color: v.string(),
    type: v.union(v.literal("income"), v.literal("expense")),
    userId: v.id("users"),
  })
    .index("byUserId", ["userId"])
    .index("byUserIdAndType", ["userId", "type"]),

  accounts: defineTable({
    name: v.string(),
    description: v.string(),
    balance: v.number(),
    isActive: v.boolean(),
    currency: v.string(),
    color: v.string(),
    icon: v.string(),
    userId: v.id("users"),
  })
    .index("byUserId", ["userId"])
    .index("byUserIdAndActive", ["userId", "isActive"]),

  transactions: defineTable({
    description: v.string(),
    amount: v.number(),
    type: v.union(v.literal("income"), v.literal("expense")),
    categoryId: v.id("categories"),
    categoryName: v.string(),
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
  })
    .index("byUserId", ["userId"])
    .index("byAccount", ["userId", "accountId"])
    .index("byCategory", ["userId", "categoryId"])
    .index("byDate", ["userId", "date"]),
});
