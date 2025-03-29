"use client";

import { formatCurrency } from "@/lib/utils";
import { useCategoryTransactions } from "@/hooks/use-category-transactions";
import { Id } from "@/convex/_generated/dataModel";

interface CategoryItemProps {
  clerkId: string;
  category: {
    _id: Id<"categories">;
    name: string;
  };
  total: number;
  color: string;
}

export function CategoryItem({ clerkId, category, total, color }: CategoryItemProps) {
  const { totalAmount, isLoading } = useCategoryTransactions({
    clerkId,
    categoryId: category._id,
  });

  if (isLoading) {
    return null; // Will be handled by parent loading state
  }

  const percentage = total > 0 ? (totalAmount / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm font-medium">{category.name}</span>
        <span className="text-sm text-muted-foreground">
          {formatCurrency(totalAmount)}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}