import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ConversationScreen from 'src/screens/Conversation/ConversationScreen';
import NotificationScreen from 'src/screens/Notification/NotificationScreen';
import SettingsScreen from 'src/screens/Settings/SettingsScreen';
import { Icon } from 'components';
import { selectUnreadCount } from 'reducer/notificationSlice';
const isAndroid = Platform.OS === 'android';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => (
  <Stack.Navigator initialRouteName="ConversationScreen" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ConversationScreen" component={ConversationScreen} />
  </Stack.Navigator>
);

const SettingsStack = () => (
  <Stack.Navigator initialRouteName="SettingsScreen" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
  </Stack.Navigator>
);

const NotificationStack = () => (
  <Stack.Navigator initialRouteName="NotificationScreen" screenOptions={{ headerShown: false }}>
    <Tab.Screen name="NotificationScreen" component={NotificationScreen} />
  </Stack.Navigator>
);

const renderTabIcon = (route, focused, color, size) => {
  let iconName = 'home';
  switch (route.name) {
    case 'Conversations':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'Notifications':
      iconName = focused ? 'notifications' : 'notifications-outline';
      break;
    case 'Settings':
      iconName = focused ? 'settings' : 'settings-outline';
      break;
    default:
      iconName = focused ? 'home' : 'home-outline';
      break;
  }
  return <Icon icon={iconName} color={focused ? '#1F93FF' : '#293F51'} />;
};

const TabStack = () => {
  const unReadCount = useSelector(selectUnreadCount);
  const tabBarBadge = useMemo(() => {
    if (unReadCount >= 100) {
      return '99+';
    }
    return unReadCount;
  }, [unReadCount]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => renderTabIcon(route, focused, color, size),
        tabBarActiveTintColor: '#1F93FF',
        tabBarInactiveTintColor: '#293F51',
        tabBarStyle: {
          paddingTop: 2,
          height: isAndroid ? 58 : 49,
          paddingBottom: isAndroid ? 10 : 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarBadgeStyle: {
          minWidth: 14,
          maxHeight: 14,
          borderRadius: 7,
          fontSize: 10,
          lineHeight: 13,
          alignSelf: undefined,
        },
      })}>
      <Tab.Screen name="Conversations" component={HomeStack} />
      <Tab.Screen
        name="Notifications"
        component={NotificationStack}
        options={{ tabBarBadge: tabBarBadge > 0 ? tabBarBadge : null }}
      />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
};
export default TabStack;
