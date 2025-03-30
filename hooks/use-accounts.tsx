"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export type Account = {
  id: Id<"accounts">;
  name: string;
  description: string;
  balance: number;
  isActive: boolean;
  currency: string;
  color: string;
  icon: string;
};

export function useAccounts() {
  const accounts = useQuery(api.accounts.getAll);
  const create = useMutation(api.accounts.create);
  const update = useMutation(api.accounts.update);
  const remove = useMutation(api.accounts.remove);

  const addAccount = async (
    account: Omit<Account, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const newAccount = await create({
        name: account.name,
        description: account.description,
        balance: account.balance,
        currency: account.currency,
        color: account.color,
        icon: account.icon,
      });
      return newAccount;
    } catch (error) {
      throw error;
    }
  };

  const updateAccount = async (
    id: Id<"accounts">,
    updates: Partial<Account>
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
      await update({
        id,
        isActive: true,
      });
    } catch (error) {
      throw error;
    }
  };

  return {
    accounts:
      accounts === undefined
        ? []
        : (accounts.map((account) => ({
            id: account._id,
            name: account.name,
            description: account.description,
            balance: account.balance,
            isActive: account.isActive || false,
            currency: account.currency,
            color: account.color,
            icon: account.icon,
          })) as Account[]),
    isLoading: accounts === undefined,
    addAccount,
    updateAccount,
    deleteAccount,
    setActiveAccount,
  };
}
