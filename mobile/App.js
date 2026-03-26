import 'react-native-gesture-handler';
import React, { useCallback, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';

import { HomeScreen } from './src/screens/HomeScreen';
import { MyTicketsScreen } from './src/screens/MyTicketsScreen';
import { TicketDetailScreen } from './src/screens/TicketDetailScreen';
import { CallScreen } from './src/screens/CallScreen';
import { CreateTicketScreen } from './src/screens/CreateTicketScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { logout } from './src/api/client';
import { colors, globalStyles } from './src/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.blue,
  },
};

const headerOpts = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700', fontSize: 16 },
  headerShadowVisible: false,
};

function TabIcon({ emoji }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

function HomeTabs({ user, onLogout, onNeedLogin }) {
  return (
    <Tab.Navigator
      screenOptions={{
        ...headerOpts,
        tabBarStyle: globalStyles.tabBar,
        tabBarActiveTintColor: colors.blue3,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <TabIcon emoji="🏛️" />,
          headerTitle: 'DMC Portal',
        }}
      >
        {(props) => (
          <HomeScreen {...props} user={user} onLogout={onLogout} onNeedLogin={onNeedLogin} />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="MyTicketsTab"
        options={{
          tabBarLabel: 'Tickets',
          tabBarIcon: () => <TabIcon emoji="🎫" />,
          headerTitle: 'My Complaints',
        }}
      >
        {(props) => (
          <MyTicketsScreen {...props} user={user} onNeedLogin={onNeedLogin} />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="CallTab"
        component={CallScreen}
        options={{
          tabBarLabel: 'Call',
          tabBarIcon: () => <TabIcon emoji="📞" />,
          headerTitle: 'Call Simulation',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = useCallback((data) => {
    setUser({ id: data.id, role: data.role });
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={headerOpts}>
          <Stack.Screen name="Main" options={{ headerShown: false }}>
            {() => (
              <HomeTabs
                user={user}
                onLogout={handleLogout}
                onNeedLogin={(nav) => nav.navigate('Login')}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Login" options={{ headerTitle: 'Sign In', presentation: 'modal' }}>
            {(props) => (
              <LoginScreen
                {...props}
                onLogin={(data) => {
                  handleLogin(data);
                  props.navigation.goBack();
                }}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="CreateTicket" options={{ headerTitle: 'File Complaint', presentation: 'modal' }}>
            {(props) => <CreateTicketScreen {...props} user={user} />}
          </Stack.Screen>
          <Stack.Screen
            name="TicketDetail"
            component={TicketDetailScreen}
            options={{ headerTitle: 'Ticket Details' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
