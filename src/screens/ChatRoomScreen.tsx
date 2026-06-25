import { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Screen } from '@/components/Screen';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { useMessages, useSendMessage } from '@/hooks/useChat';
import { useAuthStore } from '@/store/authStore';
import { Message } from '@/types';
import { RootStackParamList } from '@/navigation/types';
import { colors, radius, spacing } from '@/theme';

type Rt = RouteProp<RootStackParamList, 'ChatRoom'>;

export function ChatRoomScreen() {
  const { params } = useRoute<Rt>();
  const conversationId = params.conversationId;
  const myId = useAuthStore((s) => s.user?.id);
  const { data: messages, isLoading } = useMessages(conversationId);
  const send = useSendMessage(conversationId);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList<Message>>(null);

  const onSend = () => {
    const body = text.trim();
    if (!body) return;
    send.mutate(body);
    setText('');
  };

  const renderItem = ({ item }: { item: Message }) => {
    const mine = item.senderId === myId;
    return (
      <View style={[styles.bubbleRow, mine ? styles.rowMine : styles.rowTheirs]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.bubbleText, mine ? styles.textMine : undefined]}>{item.body}</Text>
        </View>
      </View>
    );
  };

  return (
    <Screen noPadding>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={90}
      >
        {isLoading ? (
          <Loading />
        ) : (
          <FlatList
            ref={listRef}
            data={messages ?? []}
            keyExtractor={(m) => m.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <EmptyState title="Say hello 👋" message="No messages yet — start the conversation." />
            }
          />
        )}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message…"
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
            multiline
          />
          <Pressable
            style={[styles.sendBtn, !text.trim() ? styles.sendDisabled : undefined]}
            onPress={onSend}
            disabled={!text.trim()}
          >
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.lg, flexGrow: 1 },
  bubbleRow: { marginBottom: spacing.sm, flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '78%', borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: colors.surface, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, color: colors.text },
  textMine: { color: colors.primaryText },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    fontSize: 15,
    color: colors.text,
  },
  sendBtn: {
    height: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.5 },
  sendText: { color: colors.primaryText, fontWeight: '700' },
});
