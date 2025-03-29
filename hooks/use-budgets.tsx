"use client"

import { useState, useEffect } from "react"

export type BudgetCategory = {
  id: string
  name: string
  categoryId: string
  budgeted: number
  spent: number
  accountId: string
  color: string
  icon: string
}

export type Budget = {
  id: string
  accountId: string
  month: string // Format: "YYYY-MM"
  totalBudgeted: number
  totalSpent: number
  categories: BudgetCategory[]
}

// Sample budget data
const sampleBudgets: Budget[] = [
  {
    id: "budget-1",
    accountId: "acc-1",
    month: "2025-03",
    totalBudgeted: 3000,
    totalSpent: 2450.75,
    categories: [
      {
        id: "budget-cat-1",
        name: "Food & Dining",
        categoryId: "cat-1",
        budgeted: 600,
        spent: 520.75,
        accountId: "acc-1",
        color: "#f97316",
        icon: "Utensils",
      },
      {
        id: "budget-cat-2",
        name: "Transportation",
        categoryId: "cat-2",
        budgeted: 300,
        spent: 280,
        accountId: "acc-1",
        color: "#6366f1",
        icon: "Car",
      },
      {
        id: "budget-cat-3",
        name: "Utilities",
        categoryId: "cat-3",
        budgeted: 400,
        spent: 350,
        accountId: "acc-1",
        color: "#eab308",
        icon: "Zap",
      },
      {
        id: "budget-cat-4",
        name: "Entertainment",
        categoryId: "cat-4",
        budgeted: 200,
        spent: 180,
        accountId: "acc-1",
        color: "#8b5cf6",
        icon: "Film",
      },
      {
        id: "budget-cat-5",
        name: "Shopping",
        categoryId: "cat-9",
        budgeted: 500,
        spent: 620,
        accountId: "acc-1",
        color: "#a855f7",
        icon: "ShoppingBag",
      },
      {
        id: "budget-cat-6",
        name: "Healthcare",
        categoryId: "cat-10",
        budgeted: 300,
        spent: 150,
        accountId: "acc-1",
        color: "#14b8a6",
        icon: "Stethoscope",
      },
      {
        id: "budget-cat-7",
        name: "Housing",
        categoryId: "cat-11",
        budgeted: 700,
        spent: 700,
        accountId: "acc-1",
        color: "#f43f5e",
        icon: "Home",
      },
    ],
  },
  {
    id: "budget-2",
    accountId: "acc-2",
    month: "2025-03",
    totalBudgeted: 5000,
    totalSpent: 3200,
    categories: [
      {
        id: "budget-cat-8",
        name: "Office Supplies",
        categoryId: "cat-12",
        budgeted: 1000,
        spent: 800,
        accountId: "acc-2",
        color: "#3b82f6",
        icon: "Briefcase",
      },
      {
        id: "budget-cat-9",
        name: "Marketing",
        categoryId: "cat-13",
        budgeted: 2000,
        spent: 1500,
        accountId: "acc-2",
        color: "#10b981",
        icon: "TrendingUp",
      },
      {
        id: "budget-cat-10",
        name: "Travel",
        categoryId: "cat-14",
        budgeted: 1500,
        spent: 900,
        accountId: "acc-2",
        color: "#f59e0b",
        icon: "Plane",
      },
      {
        id: "budget-cat-11",
        name: "Software",
        categoryId: "cat-15",
        budgeted: 500,
        spent: 0,
        accountId: "acc-2",
        color: "#6366f1",
        icon: "Laptop",
      },
    ],
  },
]

export function useBudgets(accountId?: string) {
  const [isLoading, setIsLoading] = useState(true)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null)

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      if (accountId) {
        const filteredBudgets = sampleBudgets.filter((budget) => budget.accountId === accountId)
        setBudgets(filteredBudgets)

        // Set current month's budget or null if not found
        const currentMonth = new Date().toISOString().slice(0, 7) // "YYYY-MM"
        const current = filteredBudgets.find((budget) => budget.month === currentMonth) || filteredBudgets[0] || null
        setCurrentBudget(current)
      } else {
        setBudgets(sampleBudgets)
        setCurrentBudget(null)
      }
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [accountId])

  const addBudget = (budget: Omit<Budget, "id">) => {
    const newBudget = {
      ...budget,
      id: `budget-${Date.now()}`,
    }
    setBudgets((prev) => [...prev, newBudget])
    return newBudget
  }

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets((prev) => prev.map((budget) => (budget.id === id ? { ...budget, ...updates } : budget)))

    if (currentBudget?.id === id) {
      setCurrentBudget((prev) => (prev ? { ...prev, ...updates } : null))
    }
  }

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((budget) => budget.id !== id))

    if (currentBudget?.id === id) {
      setCurrentBudget(null)
    }
  }

  const updateBudgetCategory = (budgetId: string, categoryId: string, updates: Partial<BudgetCategory>) => {
    setBudgets((prev) =>
      prev.map((budget) => {
        if (budget.id === budgetId) {
          const updatedCategories = budget.categories.map((category) =>
            category.id === categoryId ? { ...category, ...updates } : category,
          )

          // Recalculate totals if necessary
          let totalBudgeted = 0
          let totalSpent = 0

          updatedCategories.forEach((cat) => {
            totalBudgeted += cat.budgeted
            totalSpent += cat.spent
          })

          return {
            ...budget,
            categories: updatedCategories,
            totalBudgeted,
            totalSpent,
          }
        }
        return budget
      }),
    )

    // Update current budget if it's the one being modified
    if (currentBudget?.id === budgetId) {
      setCurrentBudget((prev) => {
        if (!prev) return null

        const updatedCategories = prev.categories.map((category) =>
          category.id === categoryId ? { ...category, ...updates } : category,
        )

        // Recalculate totals
        let totalBudgeted = 0
        let totalSpent = 0

        updatedCategories.forEach((cat) => {
          totalBudgeted += cat.budgeted
          totalSpent += cat.spent
        })

        return {
          ...prev,
          categories: updatedCategories,
          totalBudgeted,
          totalSpent,
        }
      })
    }
  }

  return {
    budgets,
    currentBudget,
    isLoading,
    addBudget,
    updateBudget,
    deleteBudget,
    updateBudgetCategory,
  }
}

