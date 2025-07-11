import { View, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, Animated, Dimensions } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import { Button } from '@gluestack-ui/themed';
import { useAuth } from '../context/authContext';
import CustomText from '../components/CustomText';
import CustomBox from '../components/CustomBox';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient'; // npm install react-native-linear-gradient

const { width } = Dimensions.get('window');

const Login = ({ navigation }: { navigation: any }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Form states
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Validation states
  const [userNameError, setUserNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const { isAuthenticated, login } = useAuth();

  // Start animations when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
    
    if (isAuthenticated === true) {
      navigation.replace('Home');
    }
  }, [fadeAnim, slideAnim, isAuthenticated, navigation]);

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setUserNameError('');
    setPasswordError('');
    
    if (!userName.trim()) {
      setUserNameError('Username is required');
      isValid = false;
    }
    
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }
    
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(userName, password);

      if (result.success) {
        navigation.replace('Home');
      } else {
        Alert.alert('Login Failed', result.msg || 'Invalid credentials or server error');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset functionality will be available soon.');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#f3f4f6', '#e5e7eb', '#d1d5db']}
        style={styles.gradientBackground}
      >
        <Animated.View 
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.logoCircle}>
              <Icon name="person" size={32} color="#007aff" />
            </View>
            <CustomText style={styles.headerTitle}>Welcome Back</CustomText>
            <CustomText style={styles.headerSubtitle}>Sign in to your account</CustomText>
          </View>

          <CustomBox style={loginBox}>
            {/* Username Input */}
            <View style={styles.inputGroup}>
              <CustomText style={styles.inputLabel}>Username</CustomText>
              <View style={styles.inputContainer}>
                <Icon name="person-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter your username"
                  value={userName}
                  onChangeText={(text) => {
                    setUserName(text.trim());
                    setUserNameError('');
                  }}
                  style={[
                    styles.input, 
                    userNameError ? styles.inputError : null
                  ]}
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  accessibilityLabel="Username input field"
                />
              </View>
              {userNameError ? (
                <CustomText style={styles.errorText}>{userNameError}</CustomText>
              ) : null}
            </View>
            
            {/* Password Input */}
            <View style={styles.inputGroup}>
              <CustomText style={styles.inputLabel}>Password</CustomText>
              <View style={styles.inputContainer}>
                <Icon name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError('');
                  }}
                  style={[
                    styles.input, 
                    passwordError ? styles.inputError : null
                  ]}
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  accessibilityLabel="Password input field"
                />
                <TouchableOpacity 
                  onPress={togglePasswordVisibility} 
                  style={styles.eyeIcon}
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#888" 
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <CustomText style={styles.errorText}>{passwordError}</CustomText>
              ) : null}
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={styles.rememberMeContainer} 
                onPress={toggleRememberMe}
                accessibilityLabel="Remember me checkbox"
                accessibilityRole="checkbox"
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Icon name="checkmark" size={12} color="#fff" />}
                </View>
                <CustomText style={styles.rememberMeText}>Remember me</CustomText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleForgotPassword}
                accessibilityLabel="Forgot password"
              >
                <CustomText style={styles.forgotPassword}>Forgot Password?</CustomText>
              </TouchableOpacity>
            </View>
          </CustomBox>

          {/* Login Button */}
          <TouchableOpacity 
            onPress={handleLogin} 
            disabled={isLoading}
            activeOpacity={0.8}
            style={styles.buttonTouchable}
          >
            <LinearGradient
              colors={['#1e88e5', '#1976d2', '#1565c0']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.gradientButton}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <CustomText style={styles.buttonText}>Sign In</CustomText>
                  <Icon name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>


          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <CustomText style={styles.signupText}>Don't have an account? </CustomText>
            <TouchableOpacity 
              onPress={() => navigation.navigate('SignUp')}
              accessibilityLabel="Go to signup"
            >
              <CustomText style={styles.signupLink}>Sign Up</CustomText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>
    </GestureHandlerRootView>
  );
};

export default Login;

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 6,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#334155',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  eyeIcon: {
    padding: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#3b82f6',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#64748b',
  },
  forgotPassword: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  buttonTouchable: {
    marginTop: 24,
    width: '100%',
    borderRadius: 12,
    shadowColor: '#1d4ed8',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientButton: {
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#cbd5e1',
  },
  orText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#64748b',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 6,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signupText: {
    fontSize: 16,
    color: '#64748b',
  },
  signupLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
});

const loginBox = {
  mainBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    backdropFilter: 'blur(10px)',
  },
  shadowBox: {
    backgroundColor: 'transparent',
    borderRadius: 16,
  },
};