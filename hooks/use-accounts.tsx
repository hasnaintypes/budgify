"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Updated Account type to match actual Convex data structure
export type Account = {
  _id: Id<"accounts">;
  _creationTime: number;
  name: string;
  description: string;
  balance: number;
  isActive: boolean;
  currency: string;
  color: string;
  icon: string;
  userId: Id<"users">;
  // Removed createdAt and updatedAt as they're not in the actual data
};

export type AccountFormData = {
  name: string;
  description?: string;
  balance: number;
  currency: string;
  color: string;
  icon: string;
  isActive: boolean;
};

export function useAccounts() {
  const accounts = useQuery(api.accounts.getAll);
  const create = useMutation(api.accounts.create);
  const update = useMutation(api.accounts.update);
  const remove = useMutation(api.accounts.remove);

  const addAccount = async (account: AccountFormData) => {
    try {
      const newAccount = await create({
        name: account.name,
        description: account.description || "",
        balance: account.balance,
        currency: account.currency,
        color: account.color,
        icon: account.icon,
        isActive: account.isActive,
      });
      return newAccount;
    } catch (error) {
      throw error;
    }
  };

  const updateAccount = async (
    id: Id<"accounts">,
    updates: Partial<AccountFormData>
  ) => {
    try {
      await update({
        id,
        ...updates,
      });
    } catch (error) {
      throw error;
    }
  };

  const deleteAccount = async (id: Id<"accounts">) => {
    try {
      await remove({
        id,
      });
    } catch (error) {
      throw error;
    }
  };

  const setActiveAccount = async (id: Id<"accounts">) => {
    try {
      // First, set all accounts to inactive
      if (accounts) {
        for (const account of accounts) {
          if (account.isActive && account._id !== id) {
            await update({
              id: account._id,
              isActive: false,
            });
          }
        }
      }

      // Then set the selected account to active
      await update({
        id,
        isActive: true,
      });
    } catch (error) {
      throw error;
    }
  };

  return {
    accounts: accounts || [],
    isLoading: accounts === undefined,
    addAccount,
    updateAccount,
    deleteAccount,
    setActiveAccount,
  };
}
