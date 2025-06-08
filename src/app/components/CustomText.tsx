import React, { ReactNode } from 'react';
import { Text, StyleSheet, Platform, TextProps } from 'react-native';

interface CustomTextProps extends TextProps {
  style?: any;
  children?: ReactNode;
}

const CustomText: React.FC<CustomTextProps> = ({ style, children, ...props }) => {
  return (
    <Text style={[styles.text, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    color: 'black',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif',
  },
});

export default CustomText;