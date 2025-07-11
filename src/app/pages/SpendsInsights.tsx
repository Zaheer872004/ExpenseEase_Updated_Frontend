import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import CustomText from '../components/CustomText';
import {theme} from '../theme/theme';
import {Text} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import {getAuthData, useAuth} from '../context/authContext';
import LinearGradient from 'react-native-linear-gradient';
import {useExpenses} from '../context/expenseContext';
import {Expense} from '../api/services/ExpenseService';


const {width} = Dimensions.get('window');


const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
};

interface CategoryData {
  name: string;
  amount: number;
  icon: string;
  color: string;
  percentage: number;
}

// Map category names to icons and colors
const categoryIcons: Record<string, {icon: string; color: string}> = {
  Food: {icon: '🍔', color: '#e74c3c'},
  Transport: {icon: '🚗', color: '#3498db'},
  Shopping: {icon: '🛍️', color: '#9b59b6'},
  Entertainment: {icon: '🎬', color: '#f39c12'},
  Health: {icon: '💊', color: '#2ecc71'},
  Bills: {icon: '📄', color: '#1abc9c'},
  Education: {icon: '📚', color: '#34495e'},
  Other: {icon: '🔄', color: '#95a5a6'},
};

const SpendInsights =   ({navigation}: {navigation: any}) => {
  const {expenses, isLoading} = useExpenses();
  const [activeTab, setActiveTab] = useState('Monthly');
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString('en-US', {month: 'short'}),
  );
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [chartData, setChartData] = useState<any>(null);

  const {user} = useAuth();

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  useEffect(() => {
    if (expenses && expenses.length > 0) {
      processExpenseData();
    }
  }, [expenses, selectedMonth, activeTab]);

  const processExpenseData = () => {
    setLoading(true);

    try {
      // Filter expenses for the selected month
      const now = new Date();
      const currentYear = now.getFullYear();
      const selectedMonthIndex = months.indexOf(selectedMonth);

      // Filter expenses by month
      const filteredExpenses = expenses.filter(expense => {
        if (!expense.created_at) return false;

        const expenseDate = new Date(expense.created_at);
        return expenseDate.getMonth() === selectedMonthIndex;
      });

      // Calculate income and expenses
      let income = 0;
      let expense = 0;

      filteredExpenses.forEach(item => {
        if (item.transaction_type === 'credited') {
          income += item.amount;
        } else {
          expense += item.amount;
        }
      });

      setTotalIncome(income);
      setTotalExpense(expense);

      // Process category data
      const categoryMap = new Map<string, number>();

      filteredExpenses.forEach(item => {
        if (item.transaction_type !== 'debited') return;

        const category = item.category || 'Other';
        const currentAmount = categoryMap.get(category) || 0;
        categoryMap.set(category, currentAmount + item.amount);
      });

      const categoryDataArray: CategoryData[] = [];

      categoryMap.forEach((amount, name) => {
        const percentage = Math.round((amount / expense) * 100);
        const {icon, color} = categoryIcons[name] || categoryIcons['Other'];

        categoryDataArray.push({
          name,
          amount,
          icon,
          color,
          percentage,
        });
      });

      // Sort categories by amount in descending order
      categoryDataArray.sort((a, b) => b.amount - a.amount);

      setCategories(categoryDataArray);

      // Generate chart data based on active tab
      generateChartData(filteredExpenses, activeTab);
    } catch (error) {
      console.error('Error processing expense data:', error);
      Alert.alert('Error', 'Failed to process expense data');
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (filteredExpenses: Expense[], tabType: string) => {
    let labels: string[] = [];
    let incomeData: number[] = [];
    let expenseData: number[] = [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const selectedMonthIndex = months.indexOf(selectedMonth);

    switch (tabType) {
      case 'Daily':
        // Get number of days in the selected month
        const daysInMonth = new Date(
          currentYear,
          selectedMonthIndex + 1,
          0,
        ).getDate();

        // Create array of days (1-31)
        labels = Array.from({length: Math.min(7, daysInMonth)}, (_, i) =>
          (i + 1).toString(),
        );

        // Initialize data arrays with zeros
        incomeData = new Array(labels.length).fill(0);
        expenseData = new Array(labels.length).fill(0);

        // Fill data arrays with actual values (limit to first 7 days for simplicity)
        filteredExpenses.forEach(item => {
          const expenseDate = new Date(item.created_at || '');
          const day = expenseDate.getDate();

          if (day <= 7) {
            // Only first 7 days for readability
            if (item.transaction_type === 'credited') {
              incomeData[day - 1] += item.amount;
            } else {
              expenseData[day - 1] += item.amount;
            }
          }
        });
        break;

      case 'Weekly':
        // Create array of weeks (Week 1-5)
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];

        // Initialize data arrays with zeros
        incomeData = new Array(labels.length).fill(0);
        expenseData = new Array(labels.length).fill(0);

        // Fill data arrays with actual values
        filteredExpenses.forEach(item => {
          const expenseDate = new Date(item.created_at || '');
          const day = expenseDate.getDate();

          // Determine week number (1-indexed)
          const weekNum = Math.min(Math.floor((day - 1) / 7), 4); // 0-4 index

          if (item.transaction_type === 'credited') {
            incomeData[weekNum] += item.amount;
          } else {
            expenseData[weekNum] += item.amount;
          }
        });
        break;

      case 'Monthly':
        // We're already filtering by month, so show a 6-month view
        const sixMonths = [];
        for (let i = 5; i >= 0; i--) {
          const monthIndex = (selectedMonthIndex - i + 12) % 12;
          sixMonths.push(months[monthIndex]);
        }
        labels = sixMonths;

        // Initialize data arrays with zeros
        incomeData = new Array(labels.length).fill(0);
        expenseData = new Array(labels.length).fill(0);

        // This would require fetching data for multiple months
        // For demo purposes, let's set some sample data
        incomeData = [3500, 4200, 5100, 4700, 5500, totalIncome];
        expenseData = [2800, 3600, 4200, 3900, 4800, totalExpense];
        break;
    }

    setChartData({
      labels,
      datasets: [
        {
          data: incomeData.length > 0 ? incomeData : [0],
          color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: expenseData.length > 0 ? expenseData : [0],
          color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ['Income', 'Expense'],
    });
  };

  const renderTabItem = (tabName: string) => (
    <TouchableOpacity
      style={[styles.tabItem, activeTab === tabName && styles.activeTabItem]}
      onPress={() => setActiveTab(tabName)}>
      <CustomText
        style={[styles.tabText, activeTab === tabName && styles.activeTabText]}>
        {tabName}
      </CustomText>
    </TouchableOpacity>
  );

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#2ecc71', '#27ae60']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.iconText}>←</Text>
          </TouchableOpacity>
          <CustomText style={styles.headerTitle}>Analytics</CustomText>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.iconText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        {renderTabItem('Daily')}
        {renderTabItem('Weekly')}
        {renderTabItem('Monthly')}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthSelector}>
          {months.map(month => (
            <TouchableOpacity
              key={month}
              style={[
                styles.monthItem,
                selectedMonth === month && styles.selectedMonth,
              ]}
              onPress={() => setSelectedMonth(month)}>
              <CustomText
                style={[
                  styles.monthText,
                  selectedMonth === month && styles.selectedMonthText,
                ]}>
                {month}
              </CustomText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.summarySection}>
          <View style={styles.summaryItem}>
            <View style={styles.summaryHeader}>
              <Text style={[styles.directionIcon, styles.incomeIcon]}>↓</Text>
              <CustomText style={styles.summaryTitle}>Total Income</CustomText>
            </View>
            <CustomText style={[styles.summaryAmount, styles.incomeAmount]}>
              {formatCurrency(totalIncome)}
            </CustomText>
          </View>

          <View style={styles.summaryItem}>
            <View style={styles.summaryHeader}>
              <Text style={[styles.directionIcon, styles.expenseIcon]}>↑</Text>
              <CustomText style={styles.summaryTitle}>Total Expense</CustomText>
            </View>
            <CustomText style={[styles.summaryAmount, styles.expenseAmount]}>
              {formatCurrency(totalExpense)}
            </CustomText>
          </View>
        </View>

        <View style={styles.chartCard}>
          <CustomText style={styles.chartTitle}>Income vs Expenses</CustomText>

          {chartData && !loading ? (
            <LineChart
              data={chartData}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
              withShadow={false}
              withDots={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero={true}
              yAxisInterval={1}
            />
          ) : (
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
              style={styles.chartLoader}
            />
          )}
        </View>

        <CustomText style={styles.sectionTitle}>
          Spending by Category
        </CustomText>

        {isLoading || loading ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={styles.loader}
          />
        ) : categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <CustomText style={styles.emptyText}>
              No expense data available
            </CustomText>
            <CustomText style={styles.emptySubText}>
              Try selecting a different month or add some expenses
            </CustomText>
          </View>
        ) : (
          <View style={styles.categoriesList}>
            {categories.map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <View
                  style={[
                    styles.categoryIcon,
                    {backgroundColor: category.color},
                  ]}>
                  <Text style={styles.categoryIconText}>{category.icon}</Text>
                </View>
                <View style={styles.categoryDetails}>
                  <View style={styles.categoryHeader}>
                    <CustomText style={styles.categoryName}>
                      {category.name}
                    </CustomText>
                    <CustomText style={styles.categoryAmount}>
                      {formatCurrency(category.amount)}
                    </CustomText>
                  </View>
                  <View style={styles.progressContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${category.percentage}%`,
                          backgroundColor: category.color,
                        },
                      ]}
                    />
                  </View>
                  <CustomText style={styles.categoryPercentage}>
                    {category.percentage}%
                  </CustomText>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <CustomText style={styles.footerText}>
              {
            user ? `Logged in as ${user.username}` : 'Not logged in'
              }
          </CustomText>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeTabItem: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
  },
  tabText: {
    fontSize: 14,
    color: '#95a5a6',
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  monthItem: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 15,
  },
  selectedMonth: {
    backgroundColor: theme.colors.primary,
  },
  monthText: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  selectedMonthText: {
    color: '#fff',
    fontWeight: '600',
  },
  summarySection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  directionIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  incomeIcon: {
    color: '#2ecc71',
  },
  expenseIcon: {
    color: '#e74c3c',
  },
  summaryTitle: {
    fontSize: 13,
    color: '#7f8c8d',
    marginLeft: 5,
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: '#2ecc71',
  },
  expenseAmount: {
    color: '#e74c3c',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  chart: {
    marginLeft: -15,
    borderRadius: 16,
  },
  chartLoader: {
    height: 220,
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  loader: {
    marginTop: 30,
    marginBottom: 30,
  },
  categoriesList: {
    marginBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryIconText: {
    fontSize: 24,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#f1f2f6',
    borderRadius: 3,
    marginBottom: 5,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 5,
  },
});

export default SpendInsights;
