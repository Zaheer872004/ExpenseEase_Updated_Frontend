import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import CustomText from '../components/CustomText';
import CustomBox from '../components/CustomBox';
import { theme } from '../theme/theme';
import { getAuthData } from '../context/authContext';
import { Platform } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Current timestamp info
const LAST_UPDATED = "2025-06-07 07:35:21";
const CURRENT_USER = "Zaheer87";

// API URL
const API_URL = Platform.select({
  android: 'http://192.168.143.13:8000',
  ios: 'http://localhost:8000',
  web: 'http://localhost:8000',
  default: 'http://localhost:8000',
});

interface SpendingSummary {
  percentageUsed: number;
  status: string;
  amountLimit: number;
  mostSpendCategory: string;
}

const HomeScreen = ({ navigation }) => {
  const [summaryData, setSummaryData] = useState<SpendingSummary>({
    percentageUsed: 85,
    status: 'At Risk',
    amountLimit: 10000,
    mostSpendCategory: 'Shopping'
  });
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchUserData();
    fetchSpendingSummary();
  }, []);

  const fetchUserData = async () => {
    try {
      const accessToken = await getAuthData("accessToken");
      if (!accessToken) return;

      const response = await fetch(`${API_URL}/user/v1/getUser`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) return;
      
      const userData = await response.json();
      setUserName(userData.first_name || 'User');
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchSpendingSummary = async () => {
    // In a real app, fetch the summary data from your API
    // This is just a placeholder for demonstration
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In reality, you would fetch this data from your backend
      setSummaryData({
        percentageUsed: 85,
        status: 'At Risk',
        amountLimit: 10000,
        mostSpendCategory: 'Shopping'
      });
    } catch (error) {
      console.error('Error fetching spending summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    fetchSpendingSummary();
  };

  const getStatusColor = (status) => {
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

  const statusColor = getStatusColor(summaryData.status);
  
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <CustomText style={styles.greeting}>
            Hello, {userName}!
          </CustomText>
          <CustomText style={styles.subHeading}>
            Track your expenses efficiently
          </CustomText>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Icon name="account-circle" size={40} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <CustomBox style={styles.summaryBox}>
        <View style={styles.progressContainer}>
          <AnimatedCircularProgress
            size={180}
            width={15}
            fill={summaryData.percentageUsed}
            tintColor="#2ecc71"
            backgroundColor="#e0f2f1"
            rotation={0}
            lineCap="round"
          >
            {(fill) => (
              <View style={styles.progressContent}>
                <CustomText style={styles.progressText}>
                  {Math.round(fill)}%
                </CustomText>
                <CustomText style={styles.progressSubText}>
                  Used
                </CustomText>
              </View>
            )}
          </AnimatedCircularProgress>
        </View>
        
        <View style={styles.summaryDetails}>
          <View style={styles.summaryItem}>
            <Icon name="alert-circle" size={24} color={statusColor} style={styles.summaryIcon} />
            <CustomText style={styles.summaryLabel}>Status:</CustomText>
            <CustomText style={[styles.summaryValue, { color: statusColor }]}>
              {summaryData.status}
            </CustomText>
          </View>
          
          <View style={styles.summaryItem}>
            <Icon name="currency-inr" size={24} color="#3498db" style={styles.summaryIcon} />
            <CustomText style={styles.summaryLabel}>Amount limit:</CustomText>
            <CustomText style={styles.summaryValue}>
              {summaryData.amountLimit.toLocaleString()} Rs.
            </CustomText>
          </View>
          
          <View style={styles.summaryItem}>
            <Icon name="shopping" size={24} color="#9b59b6" style={styles.summaryIcon} />
            <CustomText style={styles.summaryLabel}>Most Spend Category:</CustomText>
            <CustomText style={styles.summaryValue}>
              {summaryData.mostSpendCategory}
            </CustomText>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.viewDetailsButton}
          onPress={() => navigation.navigate('Spends')}
        >
          <CustomText style={styles.viewDetailsText}>View All Expenses</CustomText>
          <Icon name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>
      </CustomBox>

      <View style={styles.quickActions}>
        <CustomText style={styles.sectionTitle}>Quick Actions</CustomText>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#3498db' }]}>
              <Icon name="plus" size={24} color="#fff" />
            </View>
            <CustomText style={styles.actionText}>Add Expense</CustomText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#2ecc71' }]}>
              <Icon name="chart-bar" size={24} color="#fff" />
            </View>
            <CustomText style={styles.actionText}>Analytics</CustomText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#e74c3c' }]}>
              <Icon name="bell" size={24} color="#fff" />
            </View>
            <CustomText style={styles.actionText}>Alerts</CustomText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#f39c12' }]}>
              <Icon name="cog" size={24} color="#fff" />
            </View>
            <CustomText style={styles.actionText}>Settings</CustomText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <CustomText style={styles.footerText}>
          Last Updated: {LAST_UPDATED} | {CURRENT_USER}
        </CustomText>
      </View>
    </ScrollView>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
    padding: 5,
  },
  summaryBox: {
    mainBox: {
      backgroundColor: '#fff',
      borderRadius: 20,
      margin: 20,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
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
    color: '#2ecc71',
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
  quickActions: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
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
  footer: {
    alignItems: 'center',
    marginBottom: 100,
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default HomeScreen;