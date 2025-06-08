// SpendScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import CustomText from '../components/CustomText';
import CustomBox from '../components/CustomBox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthData } from '../context/authContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const API_URL = Platform.select({
  android: 'http://192.168.143.13:8000',
  ios: 'http://localhost:8000',
  web: 'http://localhost:8000',
  default: 'http://localhost:8000',
});

export interface ExpenseDto {
  key: number;
  amount: number;
  merchant: string;
  currency: string;
  createdAt: Date;
}

const SpendScreen = () => {
  const [expenses, setExpenses] = useState<ExpenseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setError(null);
      const token = await getAuthData('accessToken');
      if (!token) throw new Error('Access token missing.');

      const res = await fetch(`${API_URL}/expense/v1/getExpense`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!res.ok) throw new Error(`Error ${res.status}: Unable to fetch expenses.`);
      const data = await res.json();

      const formatted: ExpenseDto[] = data.map((exp: any, i: number) => ({
        key: i + 1,
        amount: parseFloat(exp.amount), // Convert amount string to number
        merchant: exp.merchant,
        currency: exp.currency,
        createdAt: new Date(), // Use current date if createdAt is missing
      }));

      setExpenses(formatted);
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const renderItem = ({ item }: { item: ExpenseDto }) => (
    <CustomBox style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.merchantInfo}>
          <View style={styles.iconCircle}>
            <Icon name="shopping" color="#fff" size={20} />
          </View>
          <CustomText style={styles.merchantName}>{item.merchant}</CustomText>
        </View>
        <CustomText style={styles.date}>{formatDate(item.createdAt)}</CustomText>
      </View>
      <CustomText style={styles.amount}>
        {item.currency} {item.amount.toLocaleString()}
      </CustomText>
    </CustomBox>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CustomText style={styles.title}>Your Expenses</CustomText>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="filter-variant" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#27ae60" />
          <CustomText style={styles.statusText}>Loading expenses...</CustomText>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Icon name="alert-circle-outline" size={60} color="#e74c3c" />
          <CustomText style={styles.statusText}>{error}</CustomText>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchExpenses}>
            <CustomText style={styles.retryText}>Retry</CustomText>
          </TouchableOpacity>
        </View>
      ) : expenses.length === 0 ? (
        <View style={styles.center}>
          <Icon name="cash-remove" size={70} color="#95a5a6" />
          <CustomText style={styles.statusText}>No expenses found</CustomText>
          <TouchableOpacity style={styles.retryBtnOutline} onPress={fetchExpenses}>
            <Icon name="refresh" size={20} color="#3498db" style={{ marginRight: 8 }} />
            <CustomText style={styles.refreshLabel}>Refresh</CustomText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderItem}
          keyExtractor={(item) => item.key.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={isLoading}
          onRefresh={fetchExpenses}
        />
      )}

      <TouchableOpacity style={styles.fab}>
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafa' },
  header: {
    backgroundColor: '#fff',
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 2,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#2c3e50' },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: '#ecf0f1',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  statusText: { marginTop: 15, fontSize: 16, color: '#666', textAlign: 'center' },
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
  retryText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  refreshLabel: { color: '#3498db', fontSize: 15, fontWeight: '600' },
  listContainer: {
    padding: 20,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  merchantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  merchantName: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#2ecc71',
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
});

export default SpendScreen;
