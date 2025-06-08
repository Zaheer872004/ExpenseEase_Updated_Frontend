import { DeviceEventEmitter, PermissionsAndroid, Platform } from 'react-native';
import { sendMessageToAPI } from './DataScienceApi';

/**
 * Requests SMS receive permission from the user
 * @returns Promise resolving to the permission result
 */
export const requestSmsPermission = async (): Promise<string> => {
  try {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    console.log(`[${timestamp}] Requesting SMS permission | User: Zaheer87`);
    
    if (Platform.OS !== 'android') {
      console.log(`[${timestamp}] SMS listening is only available on Android | User: Zaheer87`);
      return 'unavailable';
    }
    
    const permission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS
    );
    
    console.log(`[${timestamp}] SMS permission result: ${permission} | User: Zaheer87`);
    return permission;
  } catch (err) {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    console.error(`[${timestamp}] Error requesting SMS permission: ${err} | User: Zaheer87`);
    return PermissionsAndroid.RESULTS.DENIED;
  }
};

/**
 * Sets up SMS listener when permission is granted
 * @param onMessageReceived - Optional callback for when a message is received
 * @returns Cleanup function to remove the listener
 */
export const setupSmsListener = (onMessageReceived?: (message: string) => void) => {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${timestamp}] Setting up SMS listener | User: Zaheer87`);
  
  const subscriber = DeviceEventEmitter.addListener(
    'onSMSReceived',
    (message) => {
      try {
        const { messageBody, senderPhoneNumber } = JSON.parse(message);
        
        // Process message with API
        sendMessageToAPI(messageBody)
          .then(() => {
            if (onMessageReceived) {
              onMessageReceived(messageBody);
            }
          });
      } catch (error) {
        console.error(`[${timestamp}] Error processing SMS: ${error} | User: Zaheer87`);
      }
    }
  );

  // Return cleanup function
  return () => {
    console.log(`[${timestamp}] Cleaning up SMS listener | User: Zaheer87`);
    subscriber.remove();
  };
};