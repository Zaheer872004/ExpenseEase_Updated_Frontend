import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import CustomText from '../components/CustomText';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TransactionItem from '../components/TransactionItem';
import LinearGradient from 'react-native-linear-gradient';
import {useExpenses} from '../context/expenseContext';
import {Expense} from '../api/services/ExpenseService';
import {format} from 'date-fns';

const SpendScreen = ({navigation}: {navigation: any}) => {
  const {expenses, isLoading, error, refreshExpenses} = useExpenses();

  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    filterExpenses();
  }, [searchQuery, activeFilter, expenses]);

  const filterExpenses = () => {
    let filtered = [...expenses]
    .sort((a, b) => {
      // Sort by date in descending order (newest first)
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    })
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(expense =>
        expense.merchant.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply category filter
    if (activeFilter !== 'All') {
      if (activeFilter === 'Debited' || activeFilter === 'Credited') {
        filtered = filtered.filter(
          expense =>
            expense.transaction_type?.toLowerCase() ===
            activeFilter.toLowerCase(),
        );
      } else {
        // Filter by category
        filtered = filtered.filter(
          expense =>
            expense.category === activeFilter ||
            expense.merchant === activeFilter,
        );
      }
    }

    setFilteredExpenses(filtered);
  };

  const handleTransactionPress = (transaction: any) => {
    // For nested navigation use this format
    navigation.navigate('ExpenseForm', {
      expense: expenses.find(e => e.external_id === transaction.id),
    });
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMM, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Transform expense objects to transaction items for display
  const transformToTransactionItem = (expense: Expense) => {
    return {
      id: expense.external_id || '',
      merchant: expense.merchant,
      amount: expense.amount,
      type: (expense.transaction_type === 'debited' ? 'debit' : 'credit') as
        | 'debit'
        | 'credit',
      date: formatDate(expense.created_at),
      category: expense.category || expense.merchant,
    };
  };

  const filterOptions = [
    'All',
    'Debited',
    'Credited',
    // 'Others',
    // 'Food',
    // 'Transport',
    // 'Shopping',
  ];

  const renderFilterChip = (filter: string) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterChip,
        activeFilter === filter && styles.activeFilterChip,
      ]}
      onPress={() => setActiveFilter(filter)}>
      <CustomText
        style={[
          styles.filterText,
          activeFilter === filter && styles.activeFilterText,
        ]}>
        {filter}
      </CustomText>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#2ecc71', '#27ae60']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <CustomText style={styles.headerTitle}>Expenses</CustomText>
          <TouchableOpacity
            style={styles.insightsButton}
            onPress={() => navigation.navigate('SpendsInsights')}>
            <Icon name="chart-pie" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Icon
            name="magnify"
            size={20}
            color="#95a5a6"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor="#95a5a6"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={16} color="#95a5a6" />
            </TouchableOpacity>
          ) : null}
        </View>
      </LinearGradient>

      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}>
          {filterOptions.map(filter => renderFilterChip(filter))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2ecc71" />
          <CustomText style={styles.statusText}>Loading expenses...</CustomText>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Icon name="alert-circle-outline" size={60} color="#e74c3c" />
          <CustomText style={styles.statusText}>{error}</CustomText>
          <TouchableOpacity style={styles.retryBtn} onPress={refreshExpenses}>
            <CustomText style={styles.retryText}>Retry</CustomText>
          </TouchableOpacity>
        </View>
      ) : filteredExpenses.length === 0 ? (
        <View style={styles.center}>
          <Icon name="cash-remove" size={70} color="#95a5a6" />
          <CustomText style={styles.statusText}>
            {searchQuery
              ? 'No matching transactions found'
              : 'No expenses found'}
          </CustomText>
          <TouchableOpacity
            style={styles.retryBtnOutline}
            onPress={refreshExpenses}>
            <Icon
              name="refresh"
              size={20}
              color="#3498db"
              style={{marginRight: 8}}
            />
            <CustomText style={styles.refreshLabel}>Refresh</CustomText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredExpenses.map(transformToTransactionItem)}
          renderItem={({item}) => (
            <TransactionItem
              transaction={item}
              onPress={() => handleTransactionPress(item)}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={isLoading}
          onRefresh={refreshExpenses}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ExpenseForm')}>
        <LinearGradient
          colors={['#2ecc71', '#27ae60']}
          style={styles.fabGradient}>
          <Icon name="plus" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

// Don't forget to import ScrollView
import {ScrollView} from 'react-native';

const styles = StyleSheet.create({
  // Your existing styles...
  // (keeping the same styles as in your original code)
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  insightsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    height: 50,
  },
  clearButton: {
    padding: 5,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filtersScrollContent: {
    paddingHorizontal: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginRight: 10,
  },
  activeFilterChip: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
  },
  filterText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  activeFilterText: {
    color: '#2ecc71',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  statusText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  retryBtnOutline: {
    flexDirection: 'row',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  refreshLabel: {
    color: '#3498db',
    fontSize: 15,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 90,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SpendScreen;
