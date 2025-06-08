import { View, StyleSheet, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import CustomText from '../components/CustomText';
import CustomBox from '../components/CustomBox';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import { Button } from '@gluestack-ui/themed';
import { useAuth } from '../context/authContext';

const SignUp = ({ navigation }: { navigation: any }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated, register } = useAuth();

  useEffect(() => {
    if (isAuthenticated === true) {
      navigation.replace('Home');
    }
  }, [isAuthenticated]);

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !userName || !password || !phoneNumber) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
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
    } catch {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <CustomBox style={signUpBox}>
          <CustomText style={styles.heading}>Create Account</CustomText>
          <TextInput style={styles.input} placeholder="First Name" placeholderTextColor="#999" value={firstName} onChangeText={setFirstName} />
          <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor="#999" value={lastName} onChangeText={setLastName} />
          <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#999" autoCapitalize="none" value={userName} onChangeText={setUserName} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#999" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#999" secureTextEntry value={password} onChangeText={setPassword} />
          <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#999" keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} />
        </CustomBox>

        <Button onPress={handleSignUp} style={styles.button} disabled={isLoading}>
          <CustomBox style={buttonBox}>
            <CustomText style={styles.buttonText}>{isLoading ? 'Signing Up...' : 'Sign Up'}</CustomText>
          </CustomBox>
        </Button>

        <Button onPress={() => navigation.navigate('Login')} style={styles.linkButton}>
          <CustomText style={styles.linkText}>Already have an account? Login</CustomText>
        </Button>
      </View>
    </GestureHandlerRootView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fdfdfd',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#111',
  },
  button: {
    marginTop: 20,
    width: '100%',
    borderRadius: 10,
  },
  linkButton: {
    marginTop: 10,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
});

const signUpBox = {
  mainBox: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  shadowBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
};

const buttonBox = {
  mainBox: {
    backgroundColor: '#007aff',
    borderRadius: 10,
    paddingVertical: 12,
  },
  shadowBox: {
    backgroundColor: '#007aff',
    borderRadius: 10,
  },
};
