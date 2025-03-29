"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import * as Icons from "lucide-react";

export type IconName = keyof typeof Icons;

export type Category = {
  _id: Id<"categories">;
  name: string;
  icon: IconName;
  color: string;
  type: "income" | "expense";
  userId: Id<"users">;
};

export function useCategories() {
  const { user } = useUser();
  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  const categories = useQuery(
    api.categories.getAllCategories,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const addCategoryMutation = useMutation(api.categories.createCategory);
  const updateCategoryMutation = useMutation(api.categories.updateCategory);
  const deleteCategoryMutation = useMutation(api.categories.deleteCategory);

  const addCategory = async ({
    name,
    icon,
    color,
    type,
  }: Omit<Category, "_id" | "userId">) => {
    if (!convexUser?._id) return;

    await addCategoryMutation({
      name,
      icon,
      color,
      type,
      userId: convexUser._id,
    });
  };

  const updateCategory = async (
    categoryId: Id<"categories">,
    updates: Partial<Omit<Category, "_id" | "userId">>
  ) => {
    await updateCategoryMutation({
      categoryId,
      ...updates,
    });
  };

  const deleteCategory = async (categoryId: Id<"categories">) => {
    await deleteCategoryMutation({ categoryId });
  };

  return {
    categories,
    isLoading: categories === undefined || !user || convexUser === undefined,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
