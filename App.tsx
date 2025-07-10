import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, PermissionsAndroid, View } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens and navigation
import SignUp from './src/app/pages/SignUp';
import Login from './src/app/pages/Login';
import TabNavigator from './src/app/navigation/TabNavigator';

// Import context providers
import { AuthContextProvider, useAuth } from './src/app/context/authContext';
import { ExpenseContextProvider } from './src/app/context/expenseContext';

// Import services
import { setupSmsListener, requestSmsPermission } from './src/app/api/sms';

enableScreens(true);

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Create a component that will determine which stack to show based on auth status
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    // Show a centered loading spinner while checking auth
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
      }}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="SignUp" component={SignUp} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

function App(): React.JSX.Element {
  const [receiveSmsPermission, setReceiveSmsPermission] = useState('');

  // Request SMS permission when app starts
  useEffect(() => {
    const setupPermissions = async () => {
      const permission = await requestSmsPermission();
      setReceiveSmsPermission(permission);
    };
    
    setupPermissions();
  }, []);

  // Setup SMS listener when permission is granted
  useEffect(() => {
    if (receiveSmsPermission === PermissionsAndroid.RESULTS.GRANTED) {
      // The setupSmsListener function returns a cleanup function
      const cleanupListener = setupSmsListener();
      
      // Return cleanup function to be called on unmount
      return cleanupListener;
    }
  }, [receiveSmsPermission]);

  return (
    <SafeAreaProvider>
      <AuthContextProvider>
        <ExpenseContextProvider>
          <GluestackUIProvider>
            <AppNavigator />
          </GluestackUIProvider>
        </ExpenseContextProvider>
      </AuthContextProvider>
    </SafeAreaProvider>
  );
}

export default App;