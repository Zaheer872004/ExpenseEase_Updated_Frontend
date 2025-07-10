// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import TabNavigator from './TabNavigator'; // 👈 This should be your tabs
// import ExpenseForm from '../pages/ExpenseForm';
// import SpendsInsights from '../pages/SpendsInsights';

// export type RootStackParamList = {
//   MainTabs: undefined;
//   ExpenseForm: undefined;
//   SpendsInsights: undefined;
// };

// const Stack = createNativeStackNavigator<RootStackParamList>();

// const AppNavigator = () => {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator
//         initialRouteName="MainTabs"
//         screenOptions={{
//           headerShown: false,
//         }}>
//         <Stack.Screen name="MainTabs" component={TabNavigator} />
//         <Stack.Screen name="ExpenseForm" component={ExpenseForm} />
//         <Stack.Screen name="SpendsInsights" component={SpendsInsights} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };

// export default AppNavigator;
