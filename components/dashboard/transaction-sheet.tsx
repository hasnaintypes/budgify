"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, CalendarIcon, Upload, MapPin } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export function TransactionSheet() {
  const [open, setOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", emoji: "💰" });
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [location, setLocation] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useUser();

  const {
    categories,
    isLoading: categoriesLoading,
    addCategory,
  } = useCategories();

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceipt(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className="gap-2 px-4">
            <PlusIcon className="h-4 w-4" />
            Add Transaction
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md md:max-w-lg overflow-y-auto"
        >
          <SheetHeader className="mb-4">
            <SheetTitle>Add new transaction</SheetTitle>
            <SheetDescription>
              Enter the details of your transaction below.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-6 py-4">
            {/* Description field */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Grocery shopping" />
            </div>

            {/* Amount and Type in same row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" placeholder="0.00" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category and Payment Method in same row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                {categoriesLoading ? (
                  <Select disabled>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Loading..." />
                    </SelectTrigger>
                  </Select>
                ) : categories && categories.length > 0 ? (
                  <Select>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center">
                            <span className="mr-2">{category.emoji}</span>
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="border rounded-md p-2 bg-muted/30">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCategoryDialogOpen(true)}
                      className="w-full"
                    >
                      Create Category
                    </Button>
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select>
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="MOBILE_PAYMENT">
                      Mobile Payment
                    </SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date and Location in same row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <Input
                    id="location"
                    placeholder="Enter location"
                    value={""}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <MapPin className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Notes field */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes here..."
                className="resize-none"
                rows={2}
              />
            </div>

            {/* Receipt upload - direct file input */}
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="receipt">Receipt</Label>
                {receipt && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReceipt(null)}
                    className="h-6 px-2 text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleUploadClick}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {receipt ? receipt.name : "Upload Receipt"}
                </Button>
                <input
                  ref={fileInputRef}
                  id="receipt-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Recurring transaction toggle */}
            <div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
                <Label htmlFor="recurring">Recurring Transaction</Label>
              </div>

              {/* Frequency selector - only shown when recurring is enabled */}
              {isRecurring && (
                <div className="grid gap-2 pl-6 border-l-2 border-muted mt-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select>
                    <SelectTrigger id="frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <SheetFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button type="submit">Save Transaction</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

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
    </>
  );
}
