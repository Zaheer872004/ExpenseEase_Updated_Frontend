import { View, StyleSheet, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import CustomText from '../components/CustomText';
import CustomBox from '../components/CustomBox';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import { Button } from '@gluestack-ui/themed';
import { useAuth } from '../context/authContext';

const Login = ({ navigation }: { navigation: any }) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, login } = useAuth();

  useEffect(() => {
    if (isAuthenticated === true) {
      navigation.replace('Home');
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (!userName || !password) {
      Alert.alert('Missing Info', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);
    const result = await login(userName, password);

    setIsLoading(false);

    if (result.success) {
      navigation.replace('Home');
    } else {
      Alert.alert('Login Failed', result.msg || 'Invalid credentials or server error');
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <CustomBox style={loginBox}>
          <CustomText style={styles.heading}>Login</CustomText>
          <TextInput
            placeholder="User Name"
            value={userName}
            onChangeText={setUserName}
            style={styles.input}
            placeholderTextColor="#888"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholderTextColor="#888"
            secureTextEntry
          />
        </CustomBox>

        <Button onPress={handleLogin} style={styles.button} disabled={isLoading}>
          <CustomBox style={buttonBox}>
            <CustomText style={{ textAlign: 'center' }}>
              {isLoading ? 'Logging in...' : 'Submit'}
            </CustomText>
          </CustomBox>
        </Button>

        <Button onPress={() => navigation.navigate('SignUp')} style={styles.button}>
          <CustomBox style={buttonBox}>
            <CustomText style={{ textAlign: 'center' }}>Go to Signup</CustomText>
          </CustomBox>
        </Button>
      </View>
    </GestureHandlerRootView>
  );
};

export default Login;

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
});

const loginBox = {
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
