import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '@/store/authStore';
import { useBootstrapSession } from '@/hooks/useAuth';
import { useSocketLifecycle } from '@/hooks/useSocketLifecycle';
import { Loading } from '@/components/Loading';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { RegisterScreen } from '@/screens/auth/RegisterScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { SearchScreen } from '@/screens/SearchScreen';
import { CreateListingScreen } from '@/screens/CreateListingScreen';
import { ConversationsScreen } from '@/screens/ConversationsScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { ListingDetailScreen } from '@/screens/ListingDetailScreen';
import { ChatRoomScreen } from '@/screens/ChatRoomScreen';
import { AuthStackParamList, MainTabsParamList, RootStackParamList } from './types';
import { colors } from '@/theme';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabsParamList>();

function tabIcon(emoji: string) {
  return ({ color }: { color: string }) => (
    <Text style={{ fontSize: 18, color }}>{emoji}</Text>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
    </AuthStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Shopoo', tabBarLabel: 'Home', tabBarIcon: tabIcon('🏠') }}
      />
      <Tabs.Screen
        name="Search"
        component={SearchScreen}
        options={{ tabBarIcon: tabIcon('🔍') }}
      />
      <Tabs.Screen
        name="Post"
        component={CreateListingScreen}
        options={{ title: 'Sell', tabBarIcon: tabIcon('➕') }}
      />
      <Tabs.Screen
        name="Chat"
        component={ConversationsScreen}
        options={{ title: 'Chats', tabBarIcon: tabIcon('💬') }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: tabIcon('👤') }}
      />
    </Tabs.Navigator>
  );
}

function AppNavigator() {
  return (
    <RootStack.Navigator>
      <RootStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <RootStack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'Listing' }} />
      <RootStack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={({ route }) => ({ title: route.params.title ?? 'Chat' })}
      />
    </RootStack.Navigator>
  );
}

export function RootNavigator() {
  // Restore any saved session on cold start, and tie the socket to auth/AppState.
  useBootstrapSession();
  useSocketLifecycle();

  const bootstrapping = useAuthStore((s) => s.bootstrapping);
  const accessToken = useAuthStore((s) => s.accessToken);

  if (bootstrapping) {
    return <Loading />;
  }
  return accessToken ? <AppNavigator /> : <AuthNavigator />;
}
