import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import CustomText from './CustomText';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface TransactionProps {
  transaction: {
    id: string;
    merchant: string;
    amount: number;
    type: 'debit' | 'credit';
    date: string;
    category: string;
  };
  onPress?: () => void;
}

const TransactionItem: React.FC<TransactionProps> = ({ transaction, onPress }) => {
  const { merchant, amount, type, date, category } = transaction;
  
  const getIconName = () => {
    switch (category?.toLowerCase()) {
      case 'food':
        return 'food';
      case 'transport':
        return 'car';
      case 'transfer':
        return 'bank-transfer';
      case 'credit':
        return 'cash-plus';
      default:
        return 'cash';
    }
  };

  const getIconBackground = () => {
    switch (category?.toLowerCase()) {
      case 'food':
        return '#ff9f43';
      case 'transport':
        return '#54a0ff';
      case 'transfer':
        return '#5f27cd';
      case 'credit':
        return '#2ecc71';
      default:
        return '#8395a7';
    }
  };

   const formatCurrency = (value: number | undefined) => {
    if (typeof value !== 'number' || isNaN(value)) return '₹0.00';
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };


  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: getIconBackground() }]}>
        <Icon name={getIconName()} size={20} color="#fff" />
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.merchantRow}>
          <CustomText style={styles.merchant}>{merchant}</CustomText>
          <CustomText 
            style={[
              styles.amount,
              type === 'debit' ? styles.debitAmount : styles.creditAmount
            ]}
          >
            {type === 'debit' ? '-' : '+'} {formatCurrency(amount)}
          </CustomText>
        </View>
        
        <View style={styles.detailsRow}>
          <View style={styles.categoryPill}>
            <CustomText style={styles.categoryText}>{category}</CustomText>
          </View>
          <CustomText style={styles.date}>{date}</CustomText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoContainer: {
    flex: 1,
  },
  merchantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  merchant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  debitAmount: {
    color: '#e74c3c',
  },
  creditAmount: {
    color: '#2ecc71',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPill: {
    backgroundColor: '#f1f2f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#636e72',
  },
  date: {
    fontSize: 12,
    color: '#b2bec3',
  },
});

export default TransactionItem;