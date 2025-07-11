import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
  TextInput,
  Modal,
  Platform,
  Image,
} from 'react-native';
import CustomText from '../components/CustomText';
import {theme} from '../theme/theme';
import {useAuth} from '../context/authContext';
import {useExpenses} from '../context/expenseContext';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Text component as a replacement for vector icons
import { Text } from 'react-native';
import Profile from './Profile';

const { width } = Dimensions.get('window');



// Budget threshold constants
const BUDGET_THRESHOLD_WARNING = 75;
const BUDGET_THRESHOLD_DANGER = 90;

// Emoji icons for consistent display
const ICONS = {
  account: '👤',
  plus: '➕',
  chart: '📊',
  alert: '🔔',
  settings: '⚙️',
  money: '💰',
  warning: '⚠️',
  danger: '🚨',
  good: '✅',
  arrow: '→',
  shopping: '🛍️',
  food: '🍔',
  transport: '🚗',
  entertainment: '🎬',
  health: '💊',
  bills: '📄',
  education: '📚',
  other: '📦'
};

// Category icon mapping
const categoryIcons: {[key: string]: string} = {
  'Food': ICONS.food,
  'Transport': ICONS.transport,
  'Shopping': ICONS.shopping,
  'Entertainment': ICONS.entertainment,
  'Health': ICONS.health,
  'Bills': ICONS.bills,
  'Education': ICONS.education,
  'Other': ICONS.other,
};

const HomeScreen = ({navigation}: {navigation: any}) => {
  const {user} = useAuth();
  const {expenses, isLoading, error, refreshExpenses, getExpenseAnalytics} =
    useExpenses();

  const [analytics, setAnalytics] = useState({
    totalExpense: 0,
    totalIncome: 0,
    netBalance: 0,
    categories: [] as any[],
    percentageUsed: 0,
    status: 'Good',
  });
  
  // State for budget settings
  const [budgetLimit, setBudgetLimit] = useState(10000);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [tempBudget, setTempBudget] = useState('');
  
  // Load saved budget limit
  useEffect(() => {
    loadBudgetLimit();
  }, []);

  // Load analytics when expenses change or budget limit changes
  useEffect(() => {
    loadAnalytics();
  }, [expenses, budgetLimit]);

  const loadBudgetLimit = async () => {
    try {
      const savedBudget = await AsyncStorage.getItem('budgetLimit');
      if (savedBudget) {
        setBudgetLimit(parseInt(savedBudget));
      }
    } catch (error) {
      console.log('Failed to load budget limit');
    }
  };

  const saveBudgetLimit = async (limit: number) => {
    try {
      await AsyncStorage.setItem('budgetLimit', limit.toString());
      setBudgetLimit(limit);
      setShowBudgetModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save budget limit');
    }
  };

  const loadAnalytics = async () => {
    try {
      // Get the first day of current month
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const data = await getExpenseAnalytics(startOfMonth);

      // Calculate percentage used of budget
      const percentageUsed = Math.min(
        Math.round((data.totalExpense / budgetLimit) * 100),
        100,
      );

      // Determine status based on percentage
      let status = 'Good';
      if (percentageUsed > BUDGET_THRESHOLD_DANGER) {
        status = 'At Risk';
      } else if (percentageUsed > BUDGET_THRESHOLD_WARNING) {
        status = 'Warning';
      }

      setAnalytics({
        ...data,
        percentageUsed,
        status,
      });
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  const onRefresh = () => {
    refreshExpenses()
      .then(() => loadAnalytics())
      .catch(err => {
        Alert.alert('Error', 'Failed to refresh data');
      });
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      
      // Check if date is today
      if (date.toDateString() === now.toDateString()) {
        return `Today, ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
      }
      
      // Check if date is yesterday
      if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday, ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
      }
      
      // Otherwise return formatted date
      const options: Intl.DateTimeFormatOptions = { 
        day: 'numeric', 
        month: 'short'
      };
      
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      return dateString;
    }
  };

  // Process recent transactions with improved formatting and sort in descending order
  const recentTransactions = [...expenses]
    .sort((a, b) => {
      // Sort by date in descending order (newest first)
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5)
    .map(expense => ({
      id: expense.external_id || '',
      merchant: expense.merchant || 'Unknown',
      amount: expense.amount || 0,
      type: (expense.transaction_type === 'credited' ? 'credit' : 'debit') as 'debit' | 'credit',
      date: formatDate(expense.created_at),
      category: expense.category || 'Other',
      categoryIcon: categoryIcons[expense.category || 'Other'] || ICONS.other
    }));

  const getStatusColor = (status: any) => {
    switch (status.toLowerCase()) {
      case 'at risk':
        return '#e74c3c';
      case 'warning':
        return '#f39c12';
      case 'good':
        return '#2ecc71';
      default:
        return '#3498db';
    }
  };
  
  const getStatusIcon = (status: any) => {
    switch (status.toLowerCase()) {
      case 'at risk':
        return ICONS.danger;
      case 'warning':
        return ICONS.warning;
      case 'good':
        return ICONS.good;
      default:
        return ICONS.money;
    }
  };

  const statusColor = getStatusColor(analytics.status);
  
  // Format currency with ₹ symbol
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }>
        <View style={styles.header}>
          <View>
            <CustomText style={styles.greeting}>
              Hello, {user?.username || 'User'}!
            </CustomText>
            <CustomText style={styles.subHeading}>
              Track your expenses efficiently
            </CustomText>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('ProfileTab', {screen: 'Profile'})}
            >
            {/* <Text style={styles.profileIcon}>{ICONS.account}</Text> */}
            <Image source={{uri: 'https://example.com/profile-pic.png'}} style={{width: 40, height: 40, borderRadius: 20}} />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.progressContainer}>
            <AnimatedCircularProgress
              size={110}
              width={3}
              fill={analytics.percentageUsed}
              tintColor={getStatusColor(analytics.status)}
              backgroundColor="#e0f2f1"
              rotation={100}
              lineCap="square">
              {fill => (
                <View style={styles.progressContent}>
                  <CustomText style={[styles.progressText, {color: getStatusColor(analytics.status)}]}>
                    {Math.round(fill)}%
                  </CustomText>
                  <CustomText style={styles.progressSubText}>Used</CustomText>
                </View>
              )}
            </AnimatedCircularProgress>
          </View>

          <View style={styles.summaryDetails}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryIcon, {color: statusColor}]}>
                {getStatusIcon(analytics.status)}
              </Text>
              <CustomText style={styles.summaryLabel}>Status:</CustomText>
              <CustomText style={[styles.summaryValue, {color: statusColor}]}>
                {analytics.status}
              </CustomText>
            </View>

            <TouchableOpacity 
              style={styles.summaryItem}
              onPress={() => {
                setTempBudget(budgetLimit.toString());
                setShowBudgetModal(true);
              }}
            >
              <Text style={[styles.summaryIcon, {color: '#3498db'}]}>
                {ICONS.money}
              </Text>
              <CustomText style={styles.summaryLabel}>Amount limit:</CustomText>
              <View style={styles.budgetRow}>
                <CustomText style={styles.summaryValue}>
                  {formatCurrency(budgetLimit)}
                </CustomText>
                <Text style={styles.editIcon}>✏️</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.summaryItem}>
              <Text style={[styles.summaryIcon, {color: '#9b59b6'}]}>
                {analytics.categories && analytics.categories.length > 0
                  ? categoryIcons[analytics.categories[0].name] || ICONS.shopping
                  : ICONS.shopping}
              </Text>
              <CustomText style={styles.summaryLabel}>
                Most Spent:
              </CustomText>
              <CustomText style={styles.summaryValue}>
                {analytics.categories && analytics.categories.length > 0
                  ? `${analytics.categories[0].name} (${formatCurrency(analytics.categories[0].amount)})`
                  : 'None'}
              </CustomText>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryIcon, {color: '#e74c3c'}]}>
                💸
              </Text>
              <CustomText style={styles.summaryLabel}>
                Total Spent:
              </CustomText>
              <CustomText style={[styles.summaryValue, {color: '#e74c3c'}]}>
                {formatCurrency(analytics.totalExpense)}
              </CustomText>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => navigation.navigate('SpendsTab', {screen: 'Spends'})}>
            <CustomText style={styles.viewDetailsText}>
              View All Expenses
            </CustomText>
            <Text style={styles.arrowIcon}>{ICONS.arrow}</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transaction View All */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <CustomText style={styles.sectionTitle}>
              Recent Transactions
            </CustomText>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('SpendsTab', {screen: 'Spends'})
              }>
              <CustomText style={styles.viewAllText}>View All</CustomText>
            </TouchableOpacity>
          </View>

        {/* Recent Transactions */}
          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}></Text>
              <CustomText style={styles.emptyText}>
                No recent transactions
              </CustomText>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => navigation.navigate('SpendsTab', {screen: 'ExpenseForm'})}
              >
                <CustomText style={styles.addButtonText}>Add Expense</CustomText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.transactionList}>
              {recentTransactions.map((transaction) => (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.transaction}
                  onPress={() => navigation.navigate('SpendsTab', {
                    screen: 'ExpenseForm',
                    params: { expense: expenses.find(e => e.external_id === transaction.id) }
                  })}
                >
                  <View style={[
                    styles.categoryIconContainer, 
                    {backgroundColor: transaction.type === 'credit' ? '#2ecc7120' : '#e74c3c20'}
                  ]}>
                    <Text style={styles.categoryIconText}>{transaction.categoryIcon}</Text>
                  </View>
                  
                  <View style={styles.transactionDetails}>
                    <View style={styles.transactionRow}>
                      <CustomText style={styles.merchantText}>
                        {transaction.merchant}
                      </CustomText>
                      <CustomText style={[
                        styles.amountText, 
                        {color: transaction.type === 'credit' ? '#2ecc71' : '#e74c3c'}
                      ]}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </CustomText>
                    </View>
                    
                    <View style={styles.transactionRow}>
                      <CustomText style={styles.categoryText}>
                        {transaction.category}
                      </CustomText>
                      <CustomText style={styles.dateText}>
                        {transaction.date}
                      </CustomText>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.quickActions}>
          <CustomText style={styles.sectionTitle}>Quick Actions</CustomText>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('SpendsTab', {screen: 'ExpenseForm'})}>
              <View style={[styles.actionIcon, {backgroundColor: '#3498db'}]}>
                <Text style={styles.actionIconText}>{ICONS.plus}</Text>
              </View>
              <CustomText style={styles.actionText}>Add Expense</CustomText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                navigation.navigate('SpendsTab', {screen: 'SpendsInsights'})
              }>
              <View style={[styles.actionIcon, {backgroundColor: '#2ecc71'}]}>
                <Text style={styles.actionIconText}>{ICONS.chart}</Text>
              </View>
              <CustomText style={styles.actionText}>Analytics</CustomText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert("Coming Soon", "Budget alerts will be available in the next update!")}
            >
              <View style={[styles.actionIcon, {backgroundColor: '#e74c3c'}]}>
                <Text style={styles.actionIconText}>{ICONS.alert}</Text>
              </View>
              <CustomText style={styles.actionText}>Alerts</CustomText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert("Coming Soon", "Settings will be available in the next update!")}
            >
              <View style={[styles.actionIcon, {backgroundColor: '#f39c12'}]}>
                <Text style={styles.actionIconText}>{ICONS.settings}</Text>
              </View>
              <CustomText style={styles.actionText}>Settings</CustomText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <CustomText style={styles.footerText}>
            © 2025 Expense Tracker App
          </CustomText>
          <CustomText style={styles.footerText}>
            Created By - Zaheer Khan
          </CustomText>
        </View>
      </ScrollView>
      
      {/* Budget Setting Modal editing the Monthly budget */}
      <Modal
        visible={showBudgetModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBudgetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CustomText style={styles.modalTitle}>Set Monthly Budget</CustomText>
            <CustomText style={styles.modalSubtitle}>
              Enter your monthly spending limit
            </CustomText>
            
            <View style={styles.inputContainer}>
              <CustomText style={styles.currencySymbol}>₹</CustomText>
              <TextInput
                style={styles.budgetInput}
                value={tempBudget}
                onChangeText={setTempBudget}
                keyboardType="number-pad"
                placeholder="10000"
                placeholderTextColor="#95a5a6"
                autoFocus
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowBudgetModal(false)}
              >
                <CustomText style={styles.cancelButtonText}>Cancel</CustomText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  const budget = parseInt(tempBudget);
                  if (isNaN(budget) || budget <= 0) {
                    Alert.alert('Invalid Budget', 'Please enter a valid budget amount');
                    return;
                  }
                  saveBudgetLimit(budget);
                }}
              >
                <CustomText style={styles.saveButtonText}>Save</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subHeading: {
    fontSize: 16,
    color: '#777',
    marginTop: 4,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 30,
  },
  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    margin: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  progressContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  progressSubText: {
    fontSize: 16,
    color: '#666',
  },
  summaryDetails: {
    paddingHorizontal: 10,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    marginRight: 8,
    width: '40%',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 14,
    marginLeft: 8,
  },
  transactionsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  emptyText: {
    marginTop: 10,
    color: '#95a5a6',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 15,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  transactionList: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  transaction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryIconText: {
    fontSize: 24,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  merchantText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  dateText: {
    fontSize: 12,
    color: '#95a5a6',
  },
  quickActions: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionIconText: {
    fontSize: 24,
    color: '#fff',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  viewDetailsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  arrowIcon: {
    color: '#fff',
    fontSize: 18,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 100,
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 25,
    width: '100%',
  },
  currencySymbol: {
    fontSize: 24,
    color: '#2c3e50',
    marginRight: 5,
  },
  budgetInput: {
    flex: 1,
    fontSize: 24,
    padding: 10,
    color: '#2c3e50',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default HomeScreen;