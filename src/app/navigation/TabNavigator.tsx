import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Import screens
import HomeScreen from '../pages/Home';
import SpendsScreen from '../pages/Spends';
import SpendsInsightsScreen from '../pages/SpendsInsights';
import ExpenseFormScreen from '../pages/ExpenseForm';
import ProfileScreen from '../pages/Profile';
import { theme } from '../theme/theme';

// Define the tab navigator params list
type TabParamList = {
  HomeTab: undefined;
  SpendsTab: undefined;
  AddExpenseTab: undefined;
  AnalyticsTab: undefined;
  ProfileTab: undefined;
};

// Define Stack Navigator params for Home Stack
type HomeStackParamList = {
  Home: undefined;
  ExpenseForm: { expense?: any };
  SpendsInsights: undefined;
};

// Define Stack Navigator params for Spends Stack
type SpendsStackParamList = {
  Spends: undefined;
  ExpenseForm: { expense?: any };
  SpendsInsights: undefined;
};

// Define Stack Navigator params for Profile Stack
type ProfileStackParamList = {
  Profile: undefined;
};

// Create stack navigators for nested navigation
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const SpendsStack = createNativeStackNavigator<SpendsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

// Home Stack Navigator
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="ExpenseForm" component={ExpenseFormScreen} />
      <HomeStack.Screen name="SpendsInsights" component={SpendsInsightsScreen} />
    </HomeStack.Navigator>
  );
};

// Spends Stack Navigator
const SpendsStackNavigator = () => {
  return (
    <SpendsStack.Navigator screenOptions={{ headerShown: false }}>
      <SpendsStack.Screen name="Spends" component={SpendsScreen} />
      <SpendsStack.Screen name="ExpenseForm" component={ExpenseFormScreen} />
      <SpendsStack.Screen name="SpendsInsights" component={SpendsInsightsScreen} />
    </SpendsStack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown:false}}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#888',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          headerShown: false,
          tabBarIcon: ({color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : {}}>
              <Icon name="home" color={color} size={size} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="SpendsTab"
        component={SpendsStackNavigator}
        options={{
          tabBarLabel: 'Expenses',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : {}}>
              <Icon name="wallet" color={color} size={size} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="AddExpenseTab"
        component={ExpenseFormScreen}
        options={{
          headerShown: false,
          tabBarLabel: () => null,
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.addButtonContainer}>
              <View style={styles.addButton}>
                <Icon name="add" color="#fff" size={28} />
              </View>
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Prevent default action
            e.preventDefault();
            // Navigate to the ExpenseForm screen in the Spends stack
            navigation.navigate('SpendsTab', {screen: 'ExpenseForm'});
          },
        })}
      />
      <Tab.Screen
        name="AnalyticsTab"
        component={SpendsInsightsScreen}
        options={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,

          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : {}}>
              <Icon name="pie-chart" color={color} size={size} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : {}}>
              <Icon name="person" color={color} size={size} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 90 : 70,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 10,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeIconContainer: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    padding: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  addButton: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default TabNavigator;