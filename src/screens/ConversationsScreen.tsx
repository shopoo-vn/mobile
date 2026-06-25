import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { useConversations } from '@/hooks/useChat';
import { Conversation } from '@/types';
import { RootStackParamList } from '@/navigation/types';
import { colors, radius, spacing } from '@/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ConversationsScreen() {
  const navigation = useNavigation<Nav>();
  const { data, isLoading, isError, refetch, isRefetching } = useConversations();

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => {
      const title = item.peerName ?? `User ${item.peerId.slice(0, 6)}`;
      return (
        <Pressable
          style={styles.row}
          onPress={() => navigation.navigate('ChatRoom', { conversationId: item.id, title })}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(title[0] ?? '?').toUpperCase()}</Text>
          </View>
          <View style={styles.body}>
            <Text style={styles.name} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.preview} numberOfLines={1}>
              {item.lastMessage ?? 'No messages yet'}
            </Text>
          </View>
          {item.unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          ) : null}
        </Pressable>
      );
    },
    [navigation],
  );

  if (isLoading) {
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <EmptyState title="Couldn't load chats" actionLabel="Retry" onAction={() => void refetch()} />
      </Screen>
    );
  }

  return (
    <Screen noPadding>
      <FlatList
        data={data ?? []}
        keyExtractor={(c) => c.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onRefresh={() => void refetch()}
        refreshing={isRefetching}
        ListEmptyComponent={
          <EmptyState
            title="No conversations yet"
            message="Open a listing and tap “Chat với người bán” to start one."
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: colors.textMuted },
  body: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  preview: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.primaryText, fontSize: 12, fontWeight: '700' },
});
