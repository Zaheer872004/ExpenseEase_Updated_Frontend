import ApiClient, { Method } from '../ApiClient';
import { Expense } from './ExpenseService';

interface MessageParseResponse {
  success: boolean;
  expense?: Expense;
  message?: string;
}

class DataScienceService {
  /**
   * Send SMS message content to be parsed
   */
  async parseSmsMessage(message: string): Promise<MessageParseResponse> {
    try {
      const parsedData = await ApiClient.request<Expense>({
        method: Method.POST,
        endpoint: 'v1/ds/message',
        body: { message }
      });
      
      return {
        success: true,
        expense: {
          ...parsedData,
          // Ensure parsed data has the expected fields
          merchant: parsedData.merchant || 'Unknown',
          amount: parsedData.amount || 0,
          currency: parsedData.currency || 'INR',
          transaction_type: parsedData.transaction_type || 'debited',
        }
      };
    } catch (error: any) {
      console.error('SMS parsing error:', error);
      return {
        success: false,
        message: error.message || 'Failed to parse SMS message'
      };
    }
  }
}

export default new DataScienceService();