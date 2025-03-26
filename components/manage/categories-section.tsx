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
import { PlusIcon, Pencil, Trash2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useCategories, type Category } from "@/hooks/use-categories";
import { IconPicker } from "@/components/ui/icon-picker";
import { ColorPicker } from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type IconName = keyof typeof LucideIcons;

export function CategoriesSection() {
  const { categories, isLoading, addCategory, updateCategory, deleteCategory } =
    useCategories();
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: "",
    icon: "CircleDollarSign",
    color: "#10b981",
    type: "expense",
  });
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Filter categories by type
  const incomeCategories =
    categories?.filter((cat) => cat.type === "income") || [];
  const expenseCategories =
    categories?.filter((cat) => cat.type === "expense") || [];

  const handleCreateCategory = () => {
    if (
      newCategory.name?.trim() &&
      newCategory.icon &&
      newCategory.color &&
      newCategory.type
    ) {
      addCategory({
        id: `cat-${Date.now()}`,
        name: newCategory.name,
        icon: newCategory.icon,
        color: newCategory.color,
        type: newCategory.type,
      } as Category);
      setNewCategory({
        name: "",
        icon: "CircleDollarSign",
        color: "#10b981",
        type: "expense",
      });
      setCreateDialogOpen(false);
    }
  };

  const handleEditCategory = () => {
    if (editCategory && editCategory.name.trim()) {
      updateCategory(editCategory.id, editCategory);
      setEditCategory(null);
      setEditDialogOpen(false);
    }
  };

  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const openEditDialog = (category: Category) => {
    setEditCategory({ ...category });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const renderCategoryIcon = (iconName: string) => {
    const IconComponent = LucideIcons[iconName as IconName];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
  };

  return (
    <div className="space-y-8">
      {/* Income Categories */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">Income Categories</CardTitle>
            <CardDescription>Manage your income categories</CardDescription>
          </div>
          <Button
            onClick={() => {
              setNewCategory({
                name: "",
                icon: "CircleDollarSign",
                color: "#10b981",
                type: "income",
              });
              setCreateDialogOpen(true);
            }}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              ))}
            </div>
          ) : incomeCategories.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {incomeCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      {renderCategoryIcon(category.icon)}
                    </div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(category)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(category)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[120px] items-center justify-center border rounded-md">
              <div className="text-center">
                <p className="text-muted-foreground">
                  No income categories yet
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setNewCategory({
                      name: "",
                      icon: "CircleDollarSign",
                      color: "#10b981",
                      type: "income",
                    });
                    setCreateDialogOpen(true);
                  }}
                  className="mt-2"
                >
                  Create your first income category
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Categories */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">Expense Categories</CardTitle>
            <CardDescription>Manage your expense categories</CardDescription>
          </div>
          <Button
            onClick={() => {
              setNewCategory({
                name: "",
                icon: "ShoppingCart",
                color: "#f43f5e",
                type: "expense",
              });
              setCreateDialogOpen(true);
            }}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              ))}
            </div>
          ) : expenseCategories.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {expenseCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      {renderCategoryIcon(category.icon)}
                    </div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(category)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(category)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[120px] items-center justify-center border rounded-md">
              <div className="text-center">
                <p className="text-muted-foreground">
                  No expense categories yet
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setNewCategory({
                      name: "",
                      icon: "ShoppingCart",
                      color: "#f43f5e",
                      type: "expense",
                    });
                    setCreateDialogOpen(true);
                  }}
                  className="mt-2"
                >
                  Create your first expense category
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Category Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new {newCategory.type === "income" ? "income" : "expense"}{" "}
              category to organize your transactions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                placeholder="e.g., Groceries"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="categoryType">Category Type</Label>
              <Select
                value={newCategory.type}
                onValueChange={(value) =>
                  setNewCategory({
                    ...newCategory,
                    type: value as "income" | "expense",
                  })
                }
              >
                <SelectTrigger id="categoryType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <IconPicker
                  selectedIcon={newCategory.icon as IconName}
                  onIconSelect={(icon) =>
                    setNewCategory({ ...newCategory, icon })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <ColorPicker
                  selectedColor={newCategory.color || "#10b981"}
                  onColorSelect={(color) =>
                    setNewCategory({ ...newCategory, color })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCategory}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the details of your{" "}
              {editCategory?.type === "income" ? "income" : "expense"} category.
            </DialogDescription>
          </DialogHeader>
          {editCategory && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editCategoryName">Category Name</Label>
                <Input
                  id="editCategoryName"
                  value={editCategory.name}
                  onChange={(e) =>
                    setEditCategory({ ...editCategory, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <IconPicker
                    selectedIcon={editCategory.icon as IconName}
                    onIconSelect={(icon) =>
                      setEditCategory({ ...editCategory, icon })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <ColorPicker
                    selectedColor={editCategory.color}
                    onColorSelect={(color) =>
                      setEditCategory({ ...editCategory, color })
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCategory}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category "
              {categoryToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
