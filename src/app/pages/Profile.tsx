import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform as RNPlatform,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import CustomText from '../components/CustomText';
import { theme } from '../theme/theme';
import { Button, Icon } from '@gluestack-ui/themed';
import {
  Camera,
  ChevronRight,
  User,
  Phone,
  Mail,
  Bell,
  Lock,
  Moon,
  LogOut,
} from 'lucide-react-native';
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

const ICON_SIZE_LG = 24;
const ICON_SIZE_MD = 20;
const ICON_SIZE_SM = 18;

const API_URL = RNPlatform.select({
  android: 'http://192.168.143.13:8000',
  ios: 'http://localhost:8000',
  web: 'http://localhost:8000',
  default: 'http://localhost:8000',
});

const ProfileItem = ({
  icon,
  label,
  value,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity style={styles.profileItem} onPress={onPress} disabled={!onPress}>
    <View style={styles.iconContainer}>{icon}</View>
    <View style={styles.itemContent}>
      <CustomText style={styles.label}>{label}</CustomText>
      <CustomText style={styles.value}>{value}</CustomText>
    </View>
    <Icon as={ChevronRight} color={theme.colors.text.secondary} size={ICON_SIZE_LG} />
  </TouchableOpacity>
);

const Profile = ({ navigation }: { navigation: any }) => {
  const [userData, setUserData] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, logout } = useAuth();

  const formatPhoneNumber = (phone: number): string => {
    if (!phone) return 'Not set';
    const phoneStr = phone.toString();
    if (phoneStr.length === 10) {
      return `(${phoneStr.slice(0, 3)}) ${phoneStr.slice(3, 6)}-${phoneStr.slice(6)}`;
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
    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
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
      // Optionally upload image to backend or cloud storage here
      setUserData(prev => prev ? { ...prev, profilePic: selectedImage.uri } : prev);
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
        <Button onPress={() => navigation.replace('Login')} style={styles.button}>
          <CustomText>Return to Login</CustomText>
        </Button>
      </View>
    );
  }

  const profileImage = userData.profile_pic || 'https://i.pravatar.cc/300';

  console.log('Profile Data:', userData);
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
          <TouchableOpacity style={styles.editButton} onPress={pickImage}>
            <Icon as={Camera} color={theme.colors.primary} size={ICON_SIZE_LG} />
          </TouchableOpacity>
        </View>
        <CustomText style={styles.name}>
          {userData.first_name} {userData.last_name || ''}
        </CustomText>
        <CustomText style={styles.userId}>@{userData.username}</CustomText>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Personal Information</CustomText>
          <View style={styles.card}>
            <ProfileItem
              icon={<Icon as={User} color={theme.colors.primary} size={ICON_SIZE_LG} />}
              label="Name"
              value={`${userData.first_name} ${userData.last_name || ''}`}
            />
            <ProfileItem
              icon={<Icon as={Phone} color={theme.colors.primary} size={ICON_SIZE_LG} />}
              label="Phone"
              value={formatPhoneNumber(userData.phone_number as number)}
            />
            <ProfileItem
              icon={<Icon as={Mail} color={theme.colors.primary} size={ICON_SIZE_MD} />}
              label="Email"
              value={userData.email || 'Not set'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Settings</CustomText>
          <View style={styles.card}>
            <ProfileItem
              icon={<Icon as={Bell} color={theme.colors.primary} size={ICON_SIZE_MD} />}
              label="Notifications"
              value="On"
            />
            <ProfileItem
              icon={<Icon as={Lock} color={theme.colors.primary} size={ICON_SIZE_MD} />}
              label="Privacy"
              value="View Settings"
            />
            <ProfileItem
              icon={<Icon as={Moon} color={theme.colors.primary} size={ICON_SIZE_MD} />}
              label="Dark Mode"
              value="System"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <ProfileItem
              icon={<Icon as={LogOut} color="red" size={ICON_SIZE_SM} />}
              label="Logout"
              value="Sign out of your account"
              onPress={handleLogout}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <CustomText style={styles.footerText}>User ID: {userData.user_id}</CustomText>
          <CustomText style={styles.footerText}>Last Updated: 2025-06-07 05:55:53</CustomText>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: 'red',
    marginBottom: theme.spacing.lg,
  },
  button: { marginTop: theme.spacing.lg },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing['2xl'],
    backgroundColor: theme.colors.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.effects.glass.borderColor,
  },
  profileImageContainer: { position: 'relative', marginBottom: theme.spacing.lg },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.surface.secondary,
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  name: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  userId: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
  },
  content: { padding: theme.spacing.lg },
  section: { marginBottom: theme.spacing.xl },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.lg,
    ...RNPlatform.select({
      ios: {
        shadowColor: theme.colors.effects.shadow.medium.color,
        shadowOffset: theme.colors.effects.shadow.medium.offset,
        shadowOpacity: theme.colors.effects.shadow.medium.opacity,
        shadowRadius: theme.colors.effects.shadow.medium.radius,
      },
      android: { elevation: 4 },
    }),
    borderWidth: 1,
    borderColor: theme.colors.effects.glass.borderColor,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.effects.glass.borderColor,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  itemContent: { flex: 1 },
  label: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  value: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  footer: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginBottom: 4,
  },
});

export default Profile;
