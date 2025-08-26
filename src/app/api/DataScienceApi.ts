import AsyncStorage from '@react-native-async-storage/async-storage';

// API configuration
const SERVER_BASE_URL = 'http://10.108.79.13:8000';

// Current timestamp info for logging
const getCurrentTimestamp = () => {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
};

/**
 * Sends SMS message content to the server API
 * @param message - The SMS message content to be processed
 * @returns Promise resolving to the API response
 */
export const sendMessageToAPI = async (message: string) => {
  try {
    const timestamp = getCurrentTimestamp();
    console.log(`[${timestamp}] Processing SMS message | User: Zaheer87`);

    const accessToken = await AsyncStorage.getItem('accessToken');

    console.log(`[${timestamp}] Access Token: ${accessToken}`);
    if (!accessToken) {
      throw new Error('Access token is missing. Please log in again.');
    }

    console.log(`[${timestamp}] SMS received: ${message} | User: Zaheer87`);

    const response = await fetch(`${SERVER_BASE_URL}/v1/ds/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({message}),
    });

    console.log(
      `[${timestamp}] API response status: ${response.status} | User: Zaheer87`,
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${timestamp}] API Error Body: ${errorText}`);
      throw new Error(`Network response error: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    const timestamp = getCurrentTimestamp();
    console.error(
      `[${timestamp}] Error sending message to API: ${error} | User: Zaheer87`,
    );
    throw error;
  }
};
