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
import { PlusIcon, Pencil, AlertCircle, Trash2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Id } from "@/convex/_generated/dataModel";

type IconName = keyof typeof LucideIcons;

export function BudgetManagement({ accountId }: { accountId: string }) {
  const {
    currentBudget,
    isLoading,
    addBudget,
    updateBudget,
    deleteBudget,
    addBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
  } = useBudgets(accountId as Id<"accounts">);
  const { categories } = useCategories();

  // Budget creation state
  const [isCreateBudgetOpen, setIsCreateBudgetOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    month: new Date().toISOString().slice(0, 7), // Default to current month (YYYY-MM)
    totalBudgeted: 0,
    totalSpent: 0,
  });

  // Category management state
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<BudgetCategory | null>(null);
  const [newBudgetCategory, setNewBudgetCategory] = useState({
    categoryId: "",
    budgeted: 0,
  });

  // Delete confirmation state
  const [isDeleteBudgetOpen, setIsDeleteBudgetOpen] = useState(false);
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    useState<BudgetCategory | null>(null);

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

  const handleCreateBudget = async () => {
    if (!accountId) return;

    await addBudget({
      month: newBudget.month,
      accountId: accountId as Id<"accounts">,
      totalBudgeted: 0, // Start with 0, will be updated as categories are added
      totalSpent: 0,
    });

    setIsCreateBudgetOpen(false);
  };

  const handleAddCategory = async () => {
    if (
      !currentBudget ||
      !newBudgetCategory.categoryId ||
      newBudgetCategory.budgeted <= 0
    )
      return;

    const selectedCat = categories?.find(
      (c) => c._id === newBudgetCategory.categoryId
    );
    if (!selectedCat) return;

    await addBudgetCategory(currentBudget._id, {
      name: selectedCat.name,
      categoryId: selectedCat._id,
      categoryName: selectedCat.name,
      budgeted: newBudgetCategory.budgeted,
      spent: 0,
      accountId: accountId as Id<"accounts">,
      color: selectedCat.color,
      icon: selectedCat.icon,
    });

    // Reset form and close dialog
    setNewBudgetCategory({
      categoryId: "",
      budgeted: 0,
    });
    setIsAddCategoryOpen(false);
  };

  const handleEditCategory = async () => {
    if (!currentBudget || !selectedCategory) return;

    await updateBudgetCategory(currentBudget._id, selectedCategory._id, {
      budgeted: selectedCategory.budgeted,
    });

    setSelectedCategory(null);
    setIsEditCategoryOpen(false);
  };

  const handleDeleteCategory = async () => {
    if (!currentBudget || !categoryToDelete) return;

    await deleteBudgetCategory(currentBudget._id, categoryToDelete._id);
    setCategoryToDelete(null);
    setIsDeleteCategoryOpen(false);
  };

  const handleDeleteBudget = async () => {
    if (!currentBudget) return;

    await deleteBudget(currentBudget._id);
    setIsDeleteBudgetOpen(false);
  };

  const renderCategoryIcon = (iconName: string) => {
     const IconComponent =
       (LucideIcons[iconName as IconName] as LucideIcons.LucideIcon) ||
       LucideIcons.Wallet;
     return <IconComponent className="h-6 w-6" />;
  };

  // Filter out categories that are already in the budget
  const availableCategories =
    categories?.filter(
      (category) =>
        !currentBudget?.categories.some((bc) => bc.categoryId === category._id)
    ) || [];

  // Generate month options (current month and 11 months ahead)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    const value = date.toISOString().slice(0, 7); // YYYY-MM
    const label = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    return { value, label };
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle>Budget Management</CardTitle>
          {currentBudget ? (
            <CardDescription>
              {new Date(currentBudget.month + "-01").toLocaleDateString(
                "en-US",
                {
                  month: "long",
                  year: "numeric",
                }
              )}
            </CardDescription>
          ) : (
            <CardDescription>Create a budget to get started</CardDescription>
          )}
        </div>
        {currentBudget ? (
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAddCategoryOpen(true)}
              disabled={availableCategories.length === 0}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Category
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDeleteBudgetOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsCreateBudgetOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Budget
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!currentBudget ? (
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground mb-4">
              You haven't set up a budget for this account yet.
            </p>
            <Button onClick={() => setIsCreateBudgetOpen(true)}>
              Create Budget
            </Button>
          </div>
        ) : currentBudget.categories.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg bg-muted/30">
              <div>
                <h3 className="font-medium">Budget Summary</h3>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(currentBudget.totalSpent)} of{" "}
                  {formatCurrency(currentBudget.totalBudgeted)} used
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {Math.round(
                    (currentBudget.totalSpent / currentBudget.totalBudgeted) *
                      100
                  )}
                  % of budget used
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentBudget.totalSpent > currentBudget.totalBudgeted ? (
                    <span className="text-destructive">
                      Over budget by{" "}
                      {formatCurrency(
                        currentBudget.totalSpent - currentBudget.totalBudgeted
                      )}
                    </span>
                  ) : (
                    <span className="text-primary">
                      {formatCurrency(
                        currentBudget.totalBudgeted - currentBudget.totalSpent
                      )}{" "}
                      remaining
                    </span>
                  )}
                </p>
              </div>
            </div>

            {currentBudget.categories.map((category) => {
              const progress = Math.min(
                Math.round((category.spent / category.budgeted) * 100),
                100
              );
              const isOverBudget = category.spent > category.budgeted;

              return (
                <div key={category._id} className="border rounded-lg p-4">
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => {
                          setCategoryToDelete(category);
                          setIsDeleteCategoryOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
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

      {/* Create Budget Dialog */}
      <Dialog open={isCreateBudgetOpen} onOpenChange={setIsCreateBudgetOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Budget</DialogTitle>
            <DialogDescription>
              Set up a budget for this account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="budgetMonth">Budget Month</Label>
              <Select
                value={newBudget.month}
                onValueChange={(value) =>
                  setNewBudget({ ...newBudget, month: value })
                }
              >
                <SelectTrigger id="budgetMonth">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              After creating your budget, you'll be able to add categories and
              set spending limits.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateBudgetOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateBudget}>Create Budget</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                    <SelectItem key={category._id} value={category._id}>
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

      {/* Delete Category Confirmation */}
      <AlertDialog
        open={isDeleteCategoryOpen}
        onOpenChange={setIsDeleteCategoryOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{categoryToDelete?.name}"
              category from your budget? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteCategoryOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Budget Confirmation */}
      <AlertDialog
        open={isDeleteBudgetOpen}
        onOpenChange={setIsDeleteBudgetOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this entire budget? This will
              remove all budget categories and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteBudgetOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBudget}
              className="bg-destructive text-destructive-foreground"
            >
              Delete Budget
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
