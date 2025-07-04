import type { Id } from "@/convex/_generated/dataModel";

// User Types
export interface User {
  _id: Id<"users">;
  _creationTime: number;
  clerkId: string;
  email: string;
  name: string;
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
}

// Account Types - Fixed to match your actual structure
export interface Account {
  _id: Id<"accounts">;
  _creationTime: number;
  userId: Id<"users">;
  name: string;
  description?: string;
  balance: number;
  currency: Currency;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// Category Types
export interface Category {
  _id: Id<"categories">;
  _creationTime: number;
  userId: Id<"users">;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  createdAt: number;
  updatedAt: number;
}

// Transaction Types
export interface Transaction {
  _id: Id<"transactions">;
  _creationTime: number;
  userId: Id<"users">;
  accountId: Id<"accounts">;
  categoryId: Id<"categories">;
  categoryName: string;
  amount: number;
  type: TransactionType;
  description: string;
  paymentMethod: PaymentMethod;
  location?: string;
  notes?: string;
  receipt?: string;
  tags?: string[];
  date: number;
  recurringTransactionId?: Id<"recurringTransactions">;
  createdAt: number;
  updatedAt: number;
}

// Recurring Transaction Types
export interface RecurringTransaction {
  _id: Id<"recurringTransactions">;
  _creationTime: number;
  userId: Id<"users">;
  accountId: Id<"accounts">;
  categoryId: Id<"categories">;
  categoryName: string;
  amount: number;
  type: TransactionType;
  description: string;
  paymentMethod: PaymentMethod;
  frequency: RecurringFrequency;
  nextDueDate: number;
  endDate?: number;
  location?: string;
  notes?: string;
  receipt?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// Budget Types
export interface Budget {
  _id: Id<"budgets">;
  _creationTime: number;
  userId: Id<"users">;
  categoryId: Id<"categories">;
  categoryName: string;
  amount: number;
  spent: number;
  period: BudgetPeriod;
  startDate: number;
  endDate: number;
  alertThreshold: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// Enum Types
export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD" | "INR";

export type TransactionType = "income" | "expense";

export type PaymentMethod =
  | "CASH"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "BANK_TRANSFER"
  | "MOBILE_PAYMENT"
  | "OTHER";

export type RecurringFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export type BudgetPeriod = "weekly" | "monthly" | "yearly";

// Form Types
export interface TransactionFormData {
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: Id<"categories">;
  accountId: Id<"accounts">;
  paymentMethod: PaymentMethod;
  location?: string;
  notes?: string;
  receipt?: string;
  date: Date;
  isRecurring?: boolean;
  frequency?: RecurringFrequency;
  endDate?: Date;
}

export interface AccountFormData {
  name: string;
  description?: string;
  balance: number;
  currency: Currency;
  color: string;
  icon: string;
  isActive: boolean;
}

export interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface BudgetFormData {
  categoryId: Id<"categories">;
  amount: number;
  period: BudgetPeriod;
  alertThreshold: number;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
  category?: string;
  type?: TransactionType;
}

export interface DonutChartData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

// Filter Types
export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  categoryId?: Id<"categories">;
  accountId?: Id<"accounts">;
  type?: TransactionType;
  paymentMethod?: PaymentMethod;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}

// Dashboard Statistics Types
export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  budgetUtilization: number;
  transactionCount: number;
  categoryBreakdown: DonutChartData[];
  monthlyTrend: ChartDataPoint[];
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Hook Return Types
export interface UseAccountsReturn {
  accounts: Account[];
  isLoading: boolean;
  error?: string;
  addAccount: (account: AccountFormData) => Promise<void>;
  updateAccount: (
    id: Id<"accounts">,
    updates: Partial<Account>
  ) => Promise<void>;
  deleteAccount: (id: Id<"accounts">) => Promise<void>;
  setActiveAccount: (id: Id<"accounts">) => Promise<void>;
}

export interface UseTransactionsReturn {
  transactions: Transaction[];
  isLoading: boolean;
  error?: string;
  addTransaction: (transaction: TransactionFormData) => Promise<void>;
  updateTransaction: (
    id: Id<"transactions">,
    updates: Partial<Transaction>
  ) => Promise<void>;
  deleteTransaction: (id: Id<"transactions">) => Promise<void>;
  filters: TransactionFilters;
  setFilters: (filters: TransactionFilters) => void;
  pagination: PaginationState;
}

// Event Handler Types
export type EventHandler<T = any> = (event: T) => void;
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;
export type FormSubmitHandler<T = any> = (data: T) => Promise<void> | void;
