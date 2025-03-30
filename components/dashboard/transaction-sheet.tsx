"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import * as Icons from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
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
import { useCategories, type IconName } from "@/hooks/use-categories";
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
import { useToast } from "@/hooks/use-toast";

export function TransactionSheet() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    icon: "ShoppingBag" as IconName,
    color: "#000000",
    type: "expense" as const,
  });
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [location, setLocation] = useState<string>("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [accountId, setAccountId] = useState<Id<"accounts"> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const createTransaction = useMutation(api.transactions.createTransaction);
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();

  // Get user ID from Clerk
  const userDetails = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Get active accounts
  const activeAccounts = useQuery(api.accounts.getActive);

  // Set default account when accounts are loaded
  useEffect(() => {
    if (activeAccounts && activeAccounts.length > 0 && !accountId) {
      setAccountId(activeAccounts[0]._id);
    }
  }, [activeAccounts, accountId]);

  const handleCreateTransaction = async () => {
    if (!amount || !selectedCategory || !userDetails) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!accountId) {
      toast({
        title: "No active account",
        description: "Please create an account first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert date to timestamp (milliseconds since epoch)
      const dateTimestamp = date ? date.getTime() : new Date().getTime();

      // Handle receipt upload if needed
      let receiptUrl = undefined;
      if (receipt) {
        // Here you would implement file upload logic
        // For now, we'll just use a placeholder
        receiptUrl = "receipt-placeholder";
      }

      await createTransaction({
        description,
        amount: Number.parseFloat(amount),
        type: transactionType,
        categoryId: selectedCategory,
        accountId,
        userId: userDetails._id,
        paymentMethod:
          (paymentMethod as
            | "CASH"
            | "CREDIT_CARD"
            | "DEBIT_CARD"
            | "BANK_TRANSFER"
            | "MOBILE_PAYMENT"
            | "OTHER") || "OTHER",
        date: dateTimestamp,
        location: location || undefined,
        notes: notes || undefined,
        receipt: receiptUrl,
      });

      // Reset form
      setDescription("");
      setAmount("");
      setSelectedCategory(null);
      setPaymentMethod(null);
      setDate(new Date());
      setLocation("");
      setNotes("");
      setReceipt(null);
      setIsRecurring(false);
      setFrequency(null);

      toast({
        title: "Transaction created",
        description: "Your transaction has been saved successfully",
      });

      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const {
    categories,
    isLoading: categoriesLoading,
    addCategory,
  } = useCategories();

  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    "expense"
  );
  const [selectedCategory, setSelectedCategory] =
    useState<Id<"categories"> | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceipt(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const renderIcon = (iconName: IconName) => {
    const IconComponent = Icons[iconName] as React.ComponentType<{
      className?: string;
    }>;
    return IconComponent
      ? React.createElement(IconComponent, { className: "mr-2 h-4 w-4" })
      : null;
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className="gap-2 px-4">
            <Icons.Plus className="h-4 w-4" />
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
              <Input
                id="description"
                placeholder="Grocery shopping"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Amount and Type in same row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={transactionType}
                  onValueChange={(value: "income" | "expense") =>
                    setTransactionType(value)
                  }
                >
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

            {/* Category and Account in same row */}
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
                  <Select
                    value={selectedCategory?.toString() || undefined}
                    onValueChange={(value: string) =>
                      setSelectedCategory(value as Id<"categories">)
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        ?.filter(
                          (category) => category.type === transactionType
                        )
                        .map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            <div className="flex items-center">
                              {category.icon &&
                                renderIcon(category.icon as IconName)}
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
                <Label htmlFor="account">Account</Label>
                {!activeAccounts || activeAccounts.length === 0 ? (
                  <div className="border rounded-md p-2 bg-muted/30">
                    <p className="text-sm text-muted-foreground">
                      No active accounts
                    </p>
                  </div>
                ) : (
                  <Select
                    value={accountId?.toString() || undefined}
                    onValueChange={(value: string) =>
                      setAccountId(value as Id<"accounts">)
                    }
                  >
                    <SelectTrigger id="account">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeAccounts.map((account) => (
                        <SelectItem key={account._id} value={account._id}>
                          <div className="flex items-center">
                            {account.icon &&
                              renderIcon(account.icon as IconName)}
                            <span>{account.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="grid gap-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select
                value={paymentMethod || undefined}
                onValueChange={setPaymentMethod}
              >
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="MOBILE_PAYMENT">Mobile Payment</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
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
                      <Icons.Calendar className="mr-2 h-4 w-4" />
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
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <Icons.MapPin className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
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
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
                  <Icons.Upload className="mr-2 h-4 w-4" />
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
                  <Select
                    value={frequency || undefined}
                    onValueChange={setFrequency}
                  >
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
            <Button
              type="submit"
              onClick={handleCreateTransaction}
              disabled={!isAuthenticated || !userDetails}
            >
              Save Transaction
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
