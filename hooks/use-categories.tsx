"use client"

import { useState, useEffect } from "react"

// Sample categories
const sampleCategories = [
  { id: "cat-1", name: "Food & Dining", emoji: "🍔", type: "expense" },
  { id: "cat-2", name: "Transportation", emoji: "🚗", type: "expense" },
  { id: "cat-3", name: "Utilities", emoji: "🔌", type: "expense" },
  { id: "cat-4", name: "Entertainment", emoji: "🎬", type: "expense" },
  { id: "cat-5", name: "Salary", emoji: "💰", type: "income" },
  { id: "cat-6", name: "Freelance", emoji: "💻", type: "income" },
  { id: "cat-7", name: "Investments", emoji: "📈", type: "income" },
  { id: "cat-8", name: "Gifts", emoji: "🎁", type: "income" },
  { id: "cat-9", name: "Shopping", emoji: "🛒", type: "expense" },
  { id: "cat-10", name: "Healthcare", emoji: "💊", type: "expense" },
]

export type Category = {
  id: string
  name: string
  emoji: string
  type: "income" | "expense"
}

export function useCategories() {
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      // In a real app, you would fetch from API or localStorage
      setCategories(sampleCategories)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const addCategory = (category: Category) => {
    setCategories((prev) => [...prev, category])
  }

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat)))
  }

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id))
  }

  return {
    categories,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
  }
}

