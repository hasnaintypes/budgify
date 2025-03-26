"use client";

import { useState, useEffect } from "react";

// Sample categories
const sampleCategories: Category[] = [
  {
    id: "cat-1",
    name: "Food & Dining",
    icon: "Utensils",
    color: "#f97316",
    type: "expense",
  },
  {
    id: "cat-2",
    name: "Transportation",
    icon: "Car",
    color: "#6366f1",
    type: "expense",
  },
  {
    id: "cat-3",
    name: "Utilities",
    icon: "Zap",
    color: "#eab308",
    type: "expense",
  },
  {
    id: "cat-4",
    name: "Entertainment",
    icon: "Film",
    color: "#8b5cf6",
    type: "expense",
  },
  {
    id: "cat-5",
    name: "Salary",
    icon: "Briefcase",
    color: "#10b981",
    type: "income",
  },
  {
    id: "cat-6",
    name: "Freelance",
    icon: "Laptop",
    color: "#3b82f6",
    type: "income",
  },
  {
    id: "cat-7",
    name: "Investments",
    icon: "TrendingUp",
    color: "#22c55e",
    type: "income",
  },
  {
    id: "cat-8",
    name: "Gifts",
    icon: "Gift",
    color: "#ec4899",
    type: "income",
  },
  {
    id: "cat-9",
    name: "Shopping",
    icon: "ShoppingBag",
    color: "#a855f7",
    type: "expense",
  },
  {
    id: "cat-10",
    name: "Healthcare",
    icon: "Stethoscope",
    color: "#14b8a6",
    type: "expense",
  },
  {
    id: "cat-11",
    name: "Housing",
    icon: "Home",
    color: "#f43f5e",
    type: "expense",
  },
];

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense";
};

export function useCategories() {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      // In a real app, you would fetch from API or localStorage
      setCategories(sampleCategories);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const addCategory = (category: Category) => {
    setCategories((prev) => [...prev, category]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  return {
    categories,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
