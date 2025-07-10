import ApiClient, { Method } from '../ApiClient';

export interface Expense {
  external_id?: string;
  amount: number;
  user_id?: string;
  merchant: string;
  currency: string;
  transaction_type?: string;
  created_at?: string;
  category?: string;
}

export interface ExpenseFilter {
  startTime?: string;
  endTime?: string;
  merchant?: string;
  transactionType?: 'debited' | 'credited';
}

class ExpenseService {
  /**
   * Get all expenses for the current user
   */
  async getAllExpenses(): Promise<Expense[]> {
    try {
      return await ApiClient.request<Expense[]>({
        method: Method.GET,
        endpoint: 'expense/v1/getExpense'
      });
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  }

  /**
   * Add a new expense
   */
  async addExpense(expense: Expense): Promise<Expense> {
    try {
      return await ApiClient.request<Expense>({
        method: Method.POST,
        endpoint: 'expense/v1/addExpense',
        body: expense
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  }

  /**
   * Update an existing expense
   */
  async updateExpense(expense: Expense): Promise<Expense> {
    if (!expense.external_id) {
      throw new Error('Expense ID is required for update');
    }
    
    try {
      return await ApiClient.request<Expense>({
        method: Method.PATCH,
        endpoint: 'expense/v1/updateExpense',
        body: expense
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  /**
   * Get expenses by transaction type and date range
   */
  async getExpensesByType(filter: {
    transactionType: 'debited' | 'credited';
    startTime?: string;
    endTime?: string;
  }): Promise<Expense[]> {
    const { transactionType, startTime, endTime } = filter;
    let endpoint = `expense/v1/getExpense/by-type?transactionType=${transactionType}`;
    
    if (startTime) endpoint += `&startTime=${encodeURIComponent(startTime)}`;
    if (endTime) endpoint += `&endTime=${encodeURIComponent(endTime)}`;
    
    try {
      return await ApiClient.request<Expense[]>({
        method: Method.GET,
        endpoint
      });
    } catch (error) {
      console.error('Error fetching expenses by type:', error);
      throw error;
    }
  }

  /**
   * Get expenses by merchant and optional date range
   */
  async getExpensesByMerchant(merchant: string, startTime?: string, endTime?: string): Promise<Expense[]> {
    try {
      if (startTime && endTime) {
        // Use by-merchant-date endpoint when date range is provided
        const endpoint = `expense/v1/getExpense/by-merchant-date?merchant=${encodeURIComponent(merchant)}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`;
        return await ApiClient.request<Expense[]>({
          method: Method.GET,
          endpoint
        });
      } else {
        // Use by-merchant endpoint when only merchant is provided
        return await ApiClient.request<Expense[]>({
          method: Method.GET,
          endpoint: `expense/v1/getExpense/by-merchant?merchant=${encodeURIComponent(merchant)}`
        });
      }
    } catch (error) {
      console.error('Error fetching expenses by merchant:', error);
      throw error;
    }
  }
  
  /**
   * Get expense analytics - aggregate data by category
   */
  async getExpenseAnalytics(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      // Fetch all expenses
      const expenses = await this.getAllExpenses();
      
      // Filter by date if provided
      const filtered = expenses.filter(expense => {
        if (!startDate && !endDate) return true;
        
        const createdAt = expense.created_at ? new Date(expense.created_at) : null;
        if (!createdAt) return true;
        
        if (startDate && endDate) {
          return createdAt >= startDate && createdAt <= endDate;
        } else if (startDate) {
          return createdAt >= startDate;
        } else if (endDate) {
          return createdAt <= endDate;
        }
        
        return true;
      });
      
      // Process the data for analytics
      const totalExpense = filtered.reduce((sum, exp) => {
        if (exp.transaction_type === 'debited') {
          return sum + exp.amount;
        }
        return sum;
      }, 0);
      
      const totalIncome = filtered.reduce((sum, exp) => {
        if (exp.transaction_type === 'credited') {
          return sum + exp.amount;
        }
        return sum;
      }, 0);
      
      // Group by category
      const categoryMap = new Map();
      filtered.forEach(exp => {
        if (exp.transaction_type !== 'debited') return;
        
        const category = exp.category || exp.merchant || 'Other';
        if (categoryMap.has(category)) {
          categoryMap.set(category, categoryMap.get(category) + exp.amount);
        } else {
          categoryMap.set(category, exp.amount);
        }
      });
      
      // Convert to array of category data
      const categories = Array.from(categoryMap.entries()).map(([name, amount]) => {
        return {
          name,
          amount,
          percentage: totalExpense ? Math.round((amount as number / totalExpense) * 100) : 0
        };
      }).sort((a, b) => b.amount - a.amount);
      
      return {
        totalExpense,
        totalIncome,
        netBalance: totalIncome - totalExpense,
        categories
      };
    } catch (error) {
      console.error('Error calculating analytics:', error);
      throw error;
    }
  }
}

export default new ExpenseService();