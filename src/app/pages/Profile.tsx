import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
  Text
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import CustomText from '../components/CustomText';
import { theme } from '../theme/theme';
import { Button } from '@gluestack-ui/themed';
import { useAuth, getAuthData } from '../context/authContext';

export interface UserDto {
  user_id: string;
  first_name: string;
  last_name: string | null;
  phone_number: number | null;
  email: string | null;
  profile_pic: string | null;
  username?: string;
}



const API_URL = Platform.select({
  android: 'http://10.108.79.13:8000',
  ios: 'http://localhost:8000',
  web: 'http://localhost:8000',
  default: 'http://localhost:8000',
});

const ProfileItem = ({
  icon,
  iconColor,
  label,
  value,
  onPress,
}: {
  icon: string;
  iconColor: string;
  label: string;
  value: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity 
    style={styles.profileItem} 
    onPress={onPress} 
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
      <Text style={[styles.iconText, { color: iconColor }]}>{icon}</Text>
    </View>
    <View style={styles.itemContent}>
      <CustomText style={styles.label}>{label}</CustomText>
      <CustomText style={styles.value}>{value}</CustomText>
    </View>
    {onPress && (
      <Text style={styles.rightArrow}>›</Text>
    )}
  </TouchableOpacity>
);

const Profile = ({ navigation }:{navigation:any}) => {
  const [userData, setUserData] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, logout } = useAuth();

  const formatPhoneNumber = (phone: number | null): string => {
    if (!phone) return 'Not set';
    const phoneStr = phone.toString();
    if (phoneStr.length === 10) {
      return `${phoneStr.slice(0, 5)}-${phoneStr.slice(5,10)}`;
    }
    return phoneStr;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!isAuthenticated || !user?.username) {
          navigation.replace('Login');
          return;
        }

        const accessToken = await getAuthData('accessToken');
        if (!accessToken) {
          navigation.replace('Login');
          return;
        }

        const response = await fetch(`${API_URL}/user/v1/getUser`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const userDataResponse: UserDto = await response.json();
        userDataResponse.username = user.username;
        setUserData(userDataResponse);
      } catch (error) {
        Alert.alert('Error', 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigation, user, isAuthenticated]);

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const result = await logout();
            if (result.success) {
              navigation.replace('Login');
            } else {
              Alert.alert('Logout Failed', result.msg || 'An error occurred during logout');
              setLoading(false);
            }
          } catch {
            Alert.alert('Error', 'An unexpected error occurred during logout');
            setLoading(false);
          }
        },
      },
    ]);
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.8,
      selectionLimit: 1,
    });

    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert('Error', result.errorMessage || 'Failed to pick image');
      return;
    }

    const selectedImage = result.assets?.[0];
    if (selectedImage?.uri) {
      setUserData(prev => prev ? { ...prev, profile_pic: selectedImage.uri || '' } : prev);
      Alert.alert('Success', 'Profile picture updated successfully');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <CustomText style={styles.loadingText}>Loading profile...</CustomText>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <CustomText style={styles.errorText}>Failed to load user profile</CustomText>
        <Button onPress={() => navigation.replace('Login')}>
          <CustomText style={styles.buttonText}>Return to Login</CustomText>
        </Button>
      </View>
    );
  }

  const profileImage = userData.profile_pic || 'https://i.pravatar.cc/300';

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
            <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
              <Text style={styles.cameraIcon}>📷</Text>
            </TouchableOpacity>
          </View>
          
          <CustomText style={styles.name}>
            {userData.first_name} {userData.last_name || ''}
          </CustomText>
          <CustomText style={styles.username}>@{userData.username}</CustomText>
        </View>
        
        <View style={styles.infoSection}>
          <CustomText style={styles.sectionTitle}>Personal Information</CustomText>
          <View style={styles.card}>
            <ProfileItem
              icon="👤"
              iconColor="#2ecc71"
              label="Name"
              value={`${userData.first_name} ${userData.last_name || ''}`}
            />
            <View style={styles.divider} />
            
            <ProfileItem
              icon="📱"
              iconColor="#3498db"
              label="Phone"
              value={formatPhoneNumber(userData.phone_number)}
            />
            <View style={styles.divider} />
            
            <ProfileItem
              icon="✉️"
              iconColor="#9b59b6"
              label="Email"
              value={userData.email || 'Not set'}
            />
          </View>
        </View>
        
        <View style={styles.infoSection}>
          <CustomText style={styles.sectionTitle}>Settings</CustomText>
          <View style={styles.card}>
            <ProfileItem
              icon="🔔"
              iconColor="#e74c3c"
              label="Notifications"
              value="On"
              onPress={() => Alert.alert('Notifications', 'Notification settings coming soon')}
            />
            <View style={styles.divider} />
            
            <ProfileItem
              icon="🔒"
              iconColor="#f39c12"
              label="Privacy"
              value="View Settings"
              onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon')}
            />
            <View style={styles.divider} />
            
            <ProfileItem
              icon="🌓"
              iconColor="#34495e"
              label="Dark Mode"
              value="System"
              onPress={() => Alert.alert('Theme', 'Theme settings coming soon')}
            />
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          {/* 🚪 */}
          <Text style={styles.logoutIcon}></Text>
          <CustomText style={styles.logoutText}>Sign Out</CustomText>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <CustomText style={styles.footerText}>
            User ID: {userData.user_id}
          </CustomText>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cameraIcon: {
    fontSize: 18,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 15,
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
    marginLeft: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 20,
  },
  itemContent: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  value: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  rightArrow: {
    fontSize: 24,
    color: '#95a5a6',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#e74c3c',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  logoutIcon: {
    marginRight: 10,
    fontSize: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 4,
  },
});

export default Profile;