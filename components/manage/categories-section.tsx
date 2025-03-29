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
import { PlusIcon, Pencil, Trash2, LucideIcon } from "lucide-react";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

type IconName = keyof typeof LucideIcons;

export function CategoriesSection({ userId }: { userId: Id<"users"> }) {
  const { categories, isLoading, addCategory, updateCategory, deleteCategory } =
    useCategories(userId);
  const [newCategory, setNewCategory] = useState<
    Partial<Omit<Category, "_id" | "userId">>
  >({ name: "", icon: "CircleDollarSign", color: "#10b981", type: "expense" });
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

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
      try {
        addCategory({
          name: newCategory.name,
          icon: newCategory.icon,
          color: newCategory.color,
          type: newCategory.type,
        });
        toast({
          title: "Category created",
          description: `Successfully created ${newCategory.name} category`,
        });
        setNewCategory({
          name: "",
          icon: "CircleDollarSign",
          color: "#10b981",
          type: "expense",
        });
        setCreateDialogOpen(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create category. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditCategory = () => {
    if (editCategory && editCategory.name.trim()) {
      try {
        updateCategory(editCategory._id, {
          name: editCategory.name,
          icon: editCategory.icon,
          color: editCategory.color,
          type: editCategory.type,
        });
        toast({
          title: "Category updated",
          description: `Successfully updated ${editCategory.name} category`,
        });
        setEditCategory(null);
        setEditDialogOpen(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update category. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      try {
        deleteCategory(categoryToDelete._id);
        toast({
          title: "Category deleted",
          description: `Successfully deleted ${categoryToDelete.name} category`,
        });
        setCategoryToDelete(null);
        setDeleteDialogOpen(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete category. Please try again.",
          variant: "destructive",
        });
      }
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
    const IconComponent = LucideIcons[iconName as IconName] as LucideIcon;
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
  };

  // Form content for both dialog and sheet
  const CategoryForm = ({ isEdit = false }: { isEdit?: boolean }) => {
    const category = isEdit ? editCategory : newCategory;
    const setCategory = isEdit
      ? (value: Partial<Category>) =>
          setEditCategory({ ...editCategory!, ...value })
      : (value: Partial<Category>) =>
          setNewCategory({ ...newCategory, ...value });

    return (
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor={isEdit ? "editCategoryName" : "categoryName"}>
            Category Name
          </Label>
          <Input
            id={isEdit ? "editCategoryName" : "categoryName"}
            placeholder="e.g., Groceries"
            value={category?.name || ""}
            onChange={(e) => setCategory({ name: e.target.value })}
          />
        </div>
        {!isEdit && (
          <div className="grid gap-2">
            <Label htmlFor="categoryType">Category Type</Label>
            <Select
              value={category?.type}
              onValueChange={(value) =>
                setCategory({ type: value as "income" | "expense" })
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
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Icon</Label>
            <IconPicker
              selectedIcon={(category?.icon as IconName) || "CircleDollarSign"}
              onIconSelect={(icon) => setCategory({ icon })}
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <ColorPicker
              selectedColor={category?.color || "#10b981"}
              onColorSelect={(color) => setCategory({ color })}
            />
          </div>
        </div>
      </div>
    );
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
            className="w-full sm:w-auto"
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
                  key={category._id}
                  className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                    <div
                      className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      {renderCategoryIcon(category.icon)}
                    </div>
                    <span className="font-medium truncate">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
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
            className="w-full sm:w-auto"
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
                  key={category._id}
                  className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                    <div
                      className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      {renderCategoryIcon(category.icon)}
                    </div>
                    <span className="font-medium truncate">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
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

      {/* Create Category - Dialog for desktop, Sheet for mobile */}
      {isMobile ? (
        <Sheet open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <SheetContent side="bottom" className="h-[90vh] sm:max-w-none">
            <SheetHeader className="mb-4">
              <SheetTitle>Create New Category</SheetTitle>
              <SheetDescription>
                Add a new {newCategory.type === "income" ? "income" : "expense"}{" "}
                category to organize your transactions.
              </SheetDescription>
            </SheetHeader>
            <CategoryForm />
            <SheetFooter className="mt-6 flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateCategory} className="flex-1">
                Create
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a new {newCategory.type === "income" ? "income" : "expense"}{" "}
                category to organize your transactions.
              </DialogDescription>
            </DialogHeader>
            <CategoryForm />
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
      )}

      {/* Edit Category - Dialog for desktop, Sheet for mobile */}
      {isMobile ? (
        <Sheet open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <SheetContent side="bottom" className="h-[90vh] sm:max-w-none">
            <SheetHeader className="mb-4">
              <SheetTitle>Edit Category</SheetTitle>
              <SheetDescription>
                Update the details of your{" "}
                {editCategory?.type === "income" ? "income" : "expense"}{" "}
                category.
              </SheetDescription>
            </SheetHeader>
            {editCategory && <CategoryForm isEdit />}
            <SheetFooter className="mt-6 flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleEditCategory} className="flex-1">
                Save Changes
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Update the details of your{" "}
                {editCategory?.type === "income" ? "income" : "expense"}{" "}
                category.
              </DialogDescription>
            </DialogHeader>
            {editCategory && <CategoryForm isEdit />}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditCategory}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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
