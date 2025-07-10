import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ExpenseService, { Expense } from '../api/services/ExpenseService';
import DataScienceService from '../api/services/DataScienceService';
import { useAuth } from './authContext';

// Define types
interface ExpenseContextType {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  fetchExpenses: () => Promise<void>;
  addExpense: (expense: Expense) => Promise<Expense>;
  updateExpense: (expense: Expense) => Promise<Expense>;
  deleteExpense?: (id: string) => Promise<void>; // Not available in the API
  parseSmsMessage: (message: string) => Promise<{
    success: boolean;
    expense?: Expense;
    message?: string;
  }>;
  getExpensesByMerchant: (merchant: string) => Promise<Expense[]>;
  getExpenseAnalytics: (startDate?: Date, endDate?: Date) => Promise<any>;
  refreshExpenses: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

interface ExpenseProviderProps {
  children: ReactNode;
}

export const ExpenseContextProvider = ({ children }: ExpenseProviderProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth();

  // Fetch expenses when authenticated
  useEffect(() => {
    if (isAuthenticated === true) {
      fetchExpenses();
    }
  }, [isAuthenticated]);

  const fetchExpenses = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await ExpenseService.getAllExpenses();
      setExpenses(data);
    } catch (error: any) {
      console.error('Failed to fetch expenses:', error);
      setError(error.message || 'Failed to fetch expenses');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshExpenses = async () => {
    return fetchExpenses();
  };

  const addExpense = async (expense: Expense): Promise<Expense> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newExpense = await ExpenseService.addExpense(expense);
      
      // Update local state
      setExpenses(prev => [newExpense, ...prev]);
      
      return newExpense;
    } catch (error: any) {
      setError(error.message || 'Failed to add expense');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateExpense = async (expense: Expense): Promise<Expense> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedExpense = await ExpenseService.updateExpense(expense);
      
      // Update local state
      setExpenses(prev => 
        prev.map(item => 
          item.external_id === expense.external_id ? updatedExpense : item
        )
      );
      
      return updatedExpense;
    } catch (error: any) {
      setError(error.message || 'Failed to update expense');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const parseSmsMessage = async (message: string) => {
    return await DataScienceService.parseSmsMessage(message);
  };

  const getExpensesByMerchant = async (merchant: string): Promise<Expense[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await ExpenseService.getExpensesByMerchant(merchant);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch expenses by merchant');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getExpenseAnalytics = async (startDate?: Date, endDate?: Date) => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await ExpenseService.getExpenseAnalytics(startDate, endDate);
    } catch (error: any) {
      setError(error.message || 'Failed to get expense analytics');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        isLoading,
        error,
        fetchExpenses,
        addExpense,
        updateExpense,
        parseSmsMessage,
        getExpensesByMerchant,
        getExpenseAnalytics,
        refreshExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

// Custom hook to use the ExpenseContext
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseContextProvider');
  }
  return context;
};