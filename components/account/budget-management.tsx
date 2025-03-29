"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, Pencil, AlertCircle } from "lucide-react";
import { useBudgets, type BudgetCategory } from "@/hooks/use-budgets";
import { useCategories } from "@/hooks/use-categories";
import { formatCurrency } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as LucideIcons from "lucide-react";

type IconName = keyof typeof LucideIcons;

export function BudgetManagement({ accountId }: { accountId: string }) {
  const { currentBudget, isLoading, updateBudgetCategory } =
    useBudgets(accountId);
  const { categories } = useCategories();
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<BudgetCategory | null>(null);
  const [newBudgetCategory, setNewBudgetCategory] = useState({
    categoryId: "",
    budgeted: 0,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <Skeleton className="h-6 w-[180px]" />
            <Skeleton className="h-4 w-[150px] mt-1" />
          </div>
          <Skeleton className="h-10 w-[120px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentBudget) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Management</CardTitle>
          <CardDescription>No budget set for this account</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground mb-4">
            You haven't set up a budget for this account yet.
          </p>
          <Button>Create Budget</Button>
        </CardContent>
      </Card>
    );
  }

  const handleAddCategory = () => {
    if (!newBudgetCategory.categoryId || newBudgetCategory.budgeted <= 0)
      return;

    const selectedCat = categories.find(
      (c) => c._id === newBudgetCategory.categoryId
    );
    if (!selectedCat) return;

    const newCategory: BudgetCategory = {
      id: `budget-cat-${Date.now()}`,
      name: selectedCat.name,
      categoryId: selectedCat._id,
      budgeted: newBudgetCategory.budgeted,
      spent: 0,
      accountId,
      color: selectedCat.color,
      icon: selectedCat.icon,
    };

    // Add to current budget
    const updatedCategories = [...currentBudget.categories, newCategory];
    const totalBudgeted = updatedCategories.reduce(
      (sum, cat) => sum + cat.budgeted,
      0
    );

    // Reset form and close dialog
    setNewBudgetCategory({
      categoryId: "",
      budgeted: 0,
    });
    setIsAddCategoryOpen(false);
  };

  const handleEditCategory = () => {
    if (!selectedCategory) return;

    updateBudgetCategory(currentBudget.id, selectedCategory.id, {
      budgeted: selectedCategory.budgeted,
    });

    setSelectedCategory(null);
    setIsEditCategoryOpen(false);
  };

  const renderCategoryIcon = (iconName: string) => {
    const IconComponent = LucideIcons[iconName as IconName];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
  };

  // Filter out categories that are already in the budget
  const availableCategories = categories.filter(
    (category) =>
      !currentBudget.categories.some((bc) => bc.categoryId === category.id)
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle>Budget Management</CardTitle>
          <CardDescription>
            {new Date(currentBudget.month + "-01").toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </CardDescription>
        </div>
        <Button
          onClick={() => setIsAddCategoryOpen(true)}
          disabled={availableCategories.length === 0}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </CardHeader>
      <CardContent>
        {currentBudget.categories.length > 0 ? (
          <div className="space-y-4">
            {currentBudget.categories.map((category) => {
              const progress = Math.min(
                Math.round((category.spent / category.budgeted) * 100),
                100
              );
              const isOverBudget = category.spent > category.budgeted;

              return (
                <div key={category.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        {renderCategoryIcon(category.icon)}
                      </div>
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(category.spent)} of{" "}
                          {formatCurrency(category.budgeted)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedCategory(category);
                          setIsEditCategoryOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{progress}% used</span>
                      {isOverBudget ? (
                        <span className="text-destructive">
                          {formatCurrency(
                            Math.abs(category.budgeted - category.spent)
                          )}{" "}
                          over
                        </span>
                      ) : (
                        <span className="text-primary">
                          {formatCurrency(category.budgeted - category.spent)}{" "}
                          left
                        </span>
                      )}
                    </div>
                    <Progress
                      value={progress}
                      className={isOverBudget ? "bg-destructive/20" : ""}
                      indicatorClassName={isOverBudget ? "bg-destructive" : ""}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-center text-muted-foreground mb-4">
              No budget categories added yet.
            </p>
            <Button onClick={() => setIsAddCategoryOpen(true)}>
              Add Your First Category
            </Button>
          </div>
        )}
      </CardContent>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Budget Category</DialogTitle>
            <DialogDescription>
              Add a new category to your budget.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newBudgetCategory.categoryId}
                onValueChange={(value) =>
                  setNewBudgetCategory({
                    ...newBudgetCategory,
                    categoryId: value,
                  })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center">
                        <div
                          className="mr-2 h-4 w-4 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: category.color }}
                        >
                          {renderCategoryIcon(category.icon)}
                        </div>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="budgetAmount">Budget Amount</Label>
              <Input
                id="budgetAmount"
                type="number"
                placeholder="0.00"
                value={newBudgetCategory.budgeted || ""}
                onChange={(e) =>
                  setNewBudgetCategory({
                    ...newBudgetCategory,
                    budgeted: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddCategoryOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Budget Category</DialogTitle>
            <DialogDescription>
              Update your budget for {selectedCategory?.name}.
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: selectedCategory.color }}
                >
                  {renderCategoryIcon(selectedCategory.icon)}
                </div>
                <h3 className="font-medium">{selectedCategory.name}</h3>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editBudgetAmount">Budget Amount</Label>
                <Input
                  id="editBudgetAmount"
                  type="number"
                  value={selectedCategory.budgeted || ""}
                  onChange={(e) =>
                    setSelectedCategory({
                      ...selectedCategory,
                      budgeted: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">
                  Current spending: {formatCurrency(selectedCategory.spent)}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditCategoryOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditCategory}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
