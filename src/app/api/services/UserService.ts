import ApiClient, { Method } from '../ApiClient';

export interface User {
  user_id: string;
  first_name: string;
  last_name: string | null;
  username?: string;
  phone_number: string | null;
  email: string | null;
  profile_pic: string | null;
}

class UserService {
  /**
   * Get current user details
   */
  async getCurrentUser(): Promise<User> {
    try {
      return await ApiClient.request<User>({
        method: Method.GET,
        endpoint: 'user/v1/getUser'
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }
}

export default new UserService();