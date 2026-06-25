// Typed navigation param lists shared across navigators.

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
  Search: undefined;
  Post: undefined;
  Chat: undefined;
  Profile: undefined;
};

// Authenticated root stack: the tabs plus detail screens pushed over them.
export type RootStackParamList = {
  MainTabs: undefined;
  ListingDetail: { id: string };
  ChatRoom: { conversationId: string; title?: string };
};
