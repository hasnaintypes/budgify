"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { TransactionSheet } from "./transaction-sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/use-categories";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function Greeting() {
  const [open, setOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", emoji: "💰" });
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { user, isLoaded } = useUser();

  const {
    categories,
    isLoading: categoriesLoading,
    addCategory,
  } = useCategories();

  // Get current time to customize greeting
  const hours = new Date().getHours();
  let greeting = "Good morning";
  if (hours >= 12 && hours < 18) greeting = "Good afternoon";
  if (hours >= 18) greeting = "Good evening";

  const handleCreateCategory = () => {
    if (newCategory.name.trim()) {
      // addCategory({
      //   id: `cat-${Date.now()}`,
      //   name: newCategory.name,
      //   emoji: newCategory.emoji,
      // });
      setNewCategory({ name: "", emoji: "💰" });
      setCategoryDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting}, {isLoaded ? user?.firstName || "Guest" : "Loading..."}
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your expenses and manage your budget with ease.
        </p>
      </div>
      <TransactionSheet />

      {/* Category Creation Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category for your transactions.
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
              <Label>Icon</Label>
              <EmojiPicker
                selectedEmoji={newCategory.emoji}
                onEmojiSelect={(emoji) =>
                  setNewCategory({ ...newCategory, emoji })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCategoryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCategory}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
