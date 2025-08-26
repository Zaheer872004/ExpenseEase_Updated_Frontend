import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import CustomText from '../components/CustomText';
import { theme } from '../theme/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useExpenses } from '../context/expenseContext';
import { Expense } from '../api/services/ExpenseService';

// Currency options
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

// Category options with icons
const CATEGORIES = [
  { id: 'Food', name: 'Food', icon: 'food' },
  { id: 'Transport', name: 'Transport', icon: 'car' },
  { id: 'Shopping', name: 'Shopping', icon: 'shopping' },
  { id: 'Entertainment', name: 'Entertainment', icon: 'movie' },
  { id: 'Health', name: 'Health', icon: 'medical-bag' },
  { id: 'Bills', name: 'Bills', icon: 'file-document' },
  { id: 'Education', name: 'Education', icon: 'book-open-variant' },
  { id: 'Other', name: 'Other', icon: 'dots-horizontal' },
];



const ExpenseFormScreen = ({ navigation, route }:{navigation:any,route:any}) => {
  // Get expense if we're editing
  const expenseToEdit = route.params?.expense;
  const isEditing = !!expenseToEdit;
  
  const { addExpense, updateExpense, isLoading } = useExpenses();
  
  // Form state
  const [amount, setAmount] = useState(isEditing ? String(expenseToEdit.amount) : '');
  const [merchant, setMerchant] = useState(isEditing ? expenseToEdit.merchant : '');
  const [category, setCategory] = useState(isEditing ? (expenseToEdit.category || 'Other') : 'Other');
  const [currency, setCurrency] = useState(isEditing ? expenseToEdit.currency : 'INR');
  const [transactionType, setTransactionType] = useState(
    isEditing ? expenseToEdit.transaction_type || 'debited' : 'debited'
  );
  
  // UI state
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    amount: '',
    merchant: '',
  });

  const validate = () => {
    const newErrors = {
      amount: '',
      merchant: '',
    };
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!merchant.trim()) {
      newErrors.merchant = 'Please enter a merchant name';
    }
    
    setErrors(newErrors);
    return !newErrors.amount && !newErrors.merchant;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setSubmitting(true);
    
    try {
      const expenseData: Expense = {
        amount: parseFloat(amount),
        merchant,
        currency,
        transaction_type: transactionType,
        category,
        // Include additional data based on whether we're editing or creating
        ...(isEditing && { external_id: expenseToEdit.external_id }),
        ...(isEditing && { user_id: expenseToEdit.user_id }),
        ...(isEditing && { created_at: expenseToEdit.created_at }),
      };
      
      if (isEditing) {
        await updateExpense(expenseData);
        Alert.alert('Success', 'Expense updated successfully');
      } else {
        await addExpense(expenseData);
        Alert.alert('Success', 'Expense added successfully');
      }
      
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <LinearGradient
        colors={['#2ecc71', '#27ae60']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <CustomText style={styles.headerTitle}>
            {isEditing ? 'Edit Expense' : 'Add Expense'}
          </CustomText>
          <View style={styles.placeholderButton} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.formContainer}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Transaction Type */}
        <View style={styles.fieldContainer}>
          <CustomText style={styles.label}>Transaction Type</CustomText>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.segment,
                transactionType === 'debited' && styles.activeSegment
              ]}
              onPress={() => setTransactionType('debited')}
            >
              <Icon 
                name="arrow-up" 
                size={18} 
                color={transactionType === 'debited' ? '#fff' : '#636e72'} 
              />
              <CustomText 
                style={[
                  styles.segmentText,
                  transactionType === 'debited' && styles.activeSegmentText
                ]}
              >
                Expense
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segment,
                transactionType === 'credited' && styles.activeSegment,
                transactionType === 'credited' && { backgroundColor: '#27ae60' }
              ]}
              onPress={() => setTransactionType('credited')}
            >
              <Icon 
                name="arrow-down" 
                size={18} 
                color={transactionType === 'credited' ? '#fff' : '#636e72'} 
              />
              <CustomText 
                style={[
                  styles.segmentText,
                  transactionType === 'credited' && styles.activeSegmentText
                ]}
              >
                Income
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Amount with Currency */}
        <View style={styles.fieldContainer}>
          <CustomText style={styles.label}>Amount</CustomText>
          <View style={styles.amountContainer}>
            <TouchableOpacity 
              style={styles.currencyButton}
              onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
            >
              <CustomText style={styles.currencyText}>{currency}</CustomText>
              <Icon name="chevron-down" size={16} color="#636e72" />
            </TouchableOpacity>
            
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#95a5a6"
              keyboardType="numeric"
            />
          </View>
          {errors.amount ? (
            <CustomText style={styles.errorText}>{errors.amount}</CustomText>
          ) : null}
          
          {showCurrencyPicker && (
            <View style={styles.currencyPicker}>
              {CURRENCIES.map(curr => (
                <TouchableOpacity
                  key={curr}
                  style={[
                    styles.currencyOption,
                    currency === curr && styles.selectedCurrency
                  ]}
                  onPress={() => {
                    setCurrency(curr);
                    setShowCurrencyPicker(false);
                  }}
                >
                  <CustomText 
                    style={[
                      styles.currencyOptionText,
                      currency === curr && styles.selectedCurrencyText
                    ]}
                  >
                    {curr}
                  </CustomText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        {/* Merchant */}
        <View style={styles.fieldContainer}>
          <CustomText style={styles.label}>Merchant</CustomText>
          <TextInput
            style={styles.input}
            value={merchant}
            onChangeText={setMerchant}
            placeholder="Enter merchant name"
            placeholderTextColor="#95a5a6"
          />
          {errors.merchant ? (
            <CustomText style={styles.errorText}>{errors.merchant}</CustomText>
          ) : null}
        </View>
        
        {/* Category */}
        <View style={styles.fieldContainer}>
          <CustomText style={styles.label}>Category</CustomText>
          <View style={styles.categoriesContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  category === cat.id && styles.selectedCategory
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <View 
                  style={[
                    styles.categoryIcon, 
                    category === cat.id && styles.selectedCategoryIcon
                  ]}
                >
                  <Icon 
                    name={cat.icon} 
                    size={24} 
                    color={category === cat.id ? '#fff' : '#636e72'} 
                  />
                </View>
                <CustomText 
                  style={[
                    styles.categoryText,
                    category === cat.id && styles.selectedCategoryText
                  ]}
                >
                  {cat.name}
                </CustomText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={submitting || isLoading}
        >
          <CustomText style={styles.cancelButtonText}>Cancel</CustomText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSubmit}
          disabled={submitting || isLoading}
        >
          {submitting || isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Icon name="check" size={20} color="#fff" style={styles.saveIcon} />
              <CustomText style={styles.saveButtonText}>
                {isEditing ? 'Update' : 'Save'}
              </CustomText>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: 20,
    paddingBottom: 100,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 10,
    width: 90,
  },
  currencyText: {
    fontSize: 16,
    color: '#2c3e50',
    marginRight: 5,
  },
  amountInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  currencyPicker: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  currencyOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedCurrency: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
  },
  currencyOptionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  selectedCurrencyText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 5,
    marginLeft: 5,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeSegment: {
    backgroundColor: '#e74c3c',
  },
  segmentText: {
    fontSize: 16,
    color: '#636e72',
    marginLeft: 5,
  },
  activeSegmentText: {
    color: '#fff',
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  selectedCategoryIcon: {
    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: 12,
    color: '#636e72',
  },
  selectedCategoryText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  metadataContainer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  metadataText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#636e72',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  saveIcon: {
    marginRight: 5,
  },
});

export default ExpenseFormScreen;