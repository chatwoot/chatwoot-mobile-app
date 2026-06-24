import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ContactsScreen from '@/screens/contacts/ContactsScreen';

export type ContactsStackParamList = {
  ContactsScreen: undefined;
};

const Stack = createNativeStackNavigator<ContactsStackParamList>();

const ContactsStack = () => {
  return (
    <Stack.Navigator initialRouteName="ContactsScreen">
      <Stack.Screen
        options={{ headerShown: false }}
        name="ContactsScreen"
        component={ContactsScreen}
      />
    </Stack.Navigator>
  );
};

export default ContactsStack;
