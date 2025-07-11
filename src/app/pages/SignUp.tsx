import { View, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, ScrollView, Animated } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import CustomText from '../components/CustomText';
import CustomBox from '../components/CustomBox';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import { useAuth } from '../context/authContext';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const SignUp = ({ navigation }: { navigation: any }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form validation states
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [userNameError, setUserNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const { isAuthenticated, register } = useAuth();

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

  const validateStep1 = () => {
    let isValid = true;

    // Reset errors
    setFirstNameError('');
    setLastNameError('');
    setEmailError('');

    // Validate First Name
    if (!firstName.trim()) {
      setFirstNameError('First name is required');
      isValid = false;
    }

    // Validate Last Name
    if (!lastName.trim()) {
      setLastNameError('Last name is required');
      isValid = false;
    }

    // Validate Email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('Please enter a valid email address');
        isValid = false;
      }
    }

    return isValid;
  };

  const validateStep2 = () => {
    let isValid = true;

    // Reset errors
    setUserNameError('');
    setPasswordError('');
    setPhoneError('');

    // Validate Username
    if (!userName.trim()) {
      setUserNameError('Username is required');
      isValid = false;
    } else if (userName.length < 4) {
      setUserNameError('Username must be at least 4 characters');
      isValid = false;
    }

    // Validate Password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    // Validate Phone Number
    if (!phoneNumber.trim()) {
      setPhoneError('Phone number is required');
      isValid = false;
    }

    return isValid;
  };

  const nextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const previousStep = () => {
    setCurrentStep(1);
  };

  const handleSignUp = async () => {
    if (!validateStep2()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await register(firstName, lastName, userName, email, password, phoneNumber);
      if (result.success) {
        navigation.replace('Home');
      } else {
        Alert.alert('Registration Failed', result.msg || 'An error occurred during registration');
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

  const renderProgressBar = () => {
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressStepsContainer}>
          <View style={[styles.progressStep, { backgroundColor: currentStep >= 1 ? '#3b82f6' : '#d1d5db' }]}>
            <CustomText style={styles.progressStepText}>1</CustomText>
          </View>
          <View style={styles.progressLine} />
          <View style={[styles.progressStep, { backgroundColor: currentStep >= 2 ? '#3b82f6' : '#d1d5db' }]}>
            <CustomText style={styles.progressStepText}>2</CustomText>
          </View>
        </View>
        <View style={styles.progressLabelsContainer}>
          <CustomText style={[styles.progressLabel, currentStep === 1 && styles.activeProgressLabel]}>
            Personal Info
          </CustomText>
          <CustomText style={[styles.progressLabel, currentStep === 2 && styles.activeProgressLabel]}>
            Account Details
          </CustomText>
        </View>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#f3f4f6', '#e5e7eb', '#d1d5db']}
        style={styles.gradientBackground}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
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
              <CustomText style={styles.headerTitle}>Create Account </CustomText>
              {/*  */}
              <CustomText style={styles.headerSubtitle} >
                On Expense Tracker App
              </CustomText>
              <CustomText style={styles.headerSubtitle}>
                {currentStep === 1 ? "Let's get to know you" : "Set up your credentials"}
              </CustomText>
            </View>

            {renderProgressBar()}

            <CustomBox style={signUpBox}>
              {currentStep === 1 ? (
                <>
                  {/* First Name Input */}
                  <View style={styles.inputGroup}>
                    <CustomText style={styles.inputLabel}>First Name</CustomText>
                    <View style={styles.inputContainer}>
                      <Icon name="person-outline" size={20} color="#888" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, firstNameError ? styles.inputError : null]}
                        placeholder="Enter your first name"
                        placeholderTextColor="#9ca3af"
                        value={firstName}
                        onChangeText={(text) => {
                          setFirstName(text);
                          setFirstNameError('');
                        }}
                        accessibilityLabel="First name input field"
                      />
                    </View>
                    {firstNameError ? <CustomText style={styles.errorText}>{firstNameError}</CustomText> : null}
                  </View>

                  {/* Last Name Input */}
                  <View style={styles.inputGroup}>
                    <CustomText style={styles.inputLabel}>Last Name</CustomText>
                    <View style={styles.inputContainer}>
                      <Icon name="person-outline" size={20} color="#888" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, lastNameError ? styles.inputError : null]}
                        placeholder="Enter your last name"
                        placeholderTextColor="#9ca3af"
                        value={lastName}
                        onChangeText={(text) => {
                          setLastName(text);
                          setLastNameError('');
                        }}
                        accessibilityLabel="Last name input field"
                      />
                    </View>
                    {lastNameError ? <CustomText style={styles.errorText}>{lastNameError}</CustomText> : null}
                  </View>

                  {/* Email Input */}
                  <View style={styles.inputGroup}>
                    <CustomText style={styles.inputLabel}>Email Address</CustomText>
                    <View style={styles.inputContainer}>
                      <Icon name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, emailError ? styles.inputError : null]}
                        placeholder="Enter your email address"
                        placeholderTextColor="#9ca3af"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={(text) => {
                          setEmail(text);
                          setEmailError('');
                        }}
                        accessibilityLabel="Email input field"
                      />
                    </View>
                    {emailError ? <CustomText style={styles.errorText}>{emailError}</CustomText> : null}
                  </View>
                </>
              ) : (
                <>
                  {/* Username Input */}
                  <View style={styles.inputGroup}>
                    <CustomText style={styles.inputLabel}>Username</CustomText>
                    <View style={styles.inputContainer}>
                      <Icon name="at-outline" size={20} color="#888" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, userNameError ? styles.inputError : null]}
                        placeholder="Choose a username"
                        placeholderTextColor="#9ca3af"
                        autoCapitalize="none"
                        value={userName}
                        onChangeText={(text) => {
                          setUserName(text);
                          setUserNameError('');
                        }}
                        accessibilityLabel="Username input field"
                      />
                    </View>
                    {userNameError ? <CustomText style={styles.errorText}>{userNameError}</CustomText> : null}
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputGroup}>
                    <CustomText style={styles.inputLabel}>Password</CustomText>
                    <View style={styles.inputContainer}>
                      <Icon name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, passwordError ? styles.inputError : null]}
                        placeholder="Create a password"
                        placeholderTextColor="#9ca3af"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={(text) => {
                          setPassword(text);
                          setPasswordError('');
                        }}
                        accessibilityLabel="Password input field"
                      />
                      <TouchableOpacity 
                        onPress={togglePasswordVisibility} 
                        style={styles.eyeIcon}
                      >
                        <Icon 
                          name={showPassword ? "eye-off-outline" : "eye-outline"} 
                          size={20} 
                          color="#888" 
                        />
                      </TouchableOpacity>
                    </View>
                    {passwordError ? <CustomText style={styles.errorText}>{passwordError}</CustomText> : null}
                  </View>

                  {/* Phone Number Input */}
                  <View style={styles.inputGroup}>
                    <CustomText style={styles.inputLabel}>Phone Number</CustomText>
                    <View style={styles.inputContainer}>
                      <Icon name="call-outline" size={20} color="#888" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, phoneError ? styles.inputError : null]}
                        placeholder="Enter your phone number"
                        placeholderTextColor="#9ca3af"
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={(text) => {
                          setPhoneNumber(text);
                          setPhoneError('');
                        }}
                        accessibilityLabel="Phone number input field"
                      />
                    </View>
                    {phoneError ? <CustomText style={styles.errorText}>{phoneError}</CustomText> : null}
                  </View>
                </>
              )}
            </CustomBox>

            {/* Navigation Buttons */}
            {currentStep === 1 ? (
              <View style={styles.buttonsContainer}>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Login')}
                  style={styles.backButton}
                >
                  <Icon name="arrow-back" size={20} color="#64748b" style={styles.backButtonIcon} />
                  <CustomText style={styles.backButtonText}>Back to Login</CustomText>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={nextStep}
                  activeOpacity={0.8}
                  style={styles.nextButtonTouchable}
                >
                  <LinearGradient
                    colors={['#1e88e5', '#1976d2', '#1565c0']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.nextButton}
                  >
                    <CustomText style={styles.nextButtonText}>Next</CustomText>
                    <Icon name="arrow-forward" size={20} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.buttonsContainer}>
                <TouchableOpacity 
                  onPress={previousStep}
                  style={styles.backButton}
                >
                  <Icon name="arrow-back" size={20} color="#64748b" style={styles.backButtonIcon} />
                  <CustomText style={styles.backButtonText}>Previous</CustomText>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleSignUp}
                  activeOpacity={0.8}
                  disabled={isLoading}
                  style={styles.nextButtonTouchable}
                >
                  <LinearGradient
                    colors={['#1e88e5', '#1976d2', '#1565c0']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.nextButton}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <>
                        <CustomText style={styles.nextButtonText}>Create Account</CustomText>
                        <Icon name="checkmark" size={20} color="#fff" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </GestureHandlerRootView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    marginBottom: 6,
    color: '#64748b',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressStepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepText: {
    color: '#fff',
    fontWeight: '600',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#d1d5db',
    marginHorizontal: 8,
  },
  progressLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  activeProgressLabel: {
    color: '#3b82f6',
    fontWeight: '500',
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
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonIcon: {
    marginRight: 4,
  },
  backButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  nextButtonTouchable: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#1d4ed8',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 8,
  },
});

const signUpBox = {
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