import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { useListing } from '@/hooks/useListings';
import { openConversation } from '@/api/chat';
import { errorMessage } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { RootStackParamList } from '@/navigation/types';
import { colors, formatVnd, radius, spacing } from '@/theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ListingDetail'>;
type Rt = RouteProp<RootStackParamList, 'ListingDetail'>;

const CONDITION_LABEL: Record<string, string> = {
  new: 'New',
  like_new: 'Like new',
  used: 'Used',
};

function Badge({ text }: { text: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

export function ListingDetailScreen() {
  const { params } = useRoute<Rt>();
  const navigation = useNavigation<Nav>();
  const { data: listing, isLoading, isError, refetch } = useListing(params.id);
  const myId = useAuthStore((s) => s.user?.id);
  const [opening, setOpening] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  }

  if (isError || !listing) {
    return (
      <Screen>
        <EmptyState
          title="Listing unavailable"
          message="It may have been removed."
          actionLabel="Retry"
          onAction={() => void refetch()}
        />
      </Screen>
    );
  }

  const isOwn = myId === listing.sellerId;

  const onChat = async () => {
    setOpening(true);
    setChatError(null);
    try {
      const conv = await openConversation({
        sellerId: listing.sellerId,
        listingId: listing.id,
      });
      navigation.navigate('ChatRoom', { conversationId: conv.id, title: listing.title });
    } catch (e) {
      setChatError(errorMessage(e, 'Could not start the chat'));
    } finally {
      setOpening(false);
    }
  };

  return (
    <Screen noPadding>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroText}>{(listing.title[0] ?? '?').toUpperCase()}</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.price}>{formatVnd(listing.price)}</Text>
          <View style={styles.badges}>
            <Badge text={CONDITION_LABEL[listing.condition] ?? listing.condition} />
            {listing.location ? <Badge text={listing.location} /> : null}
            <Badge text={listing.status} />
          </View>
          {listing.description ? (
            <Text style={styles.desc}>{listing.description}</Text>
          ) : (
            <Text style={styles.descMuted}>No description provided.</Text>
          )}
          {chatError ? <Text style={styles.error}>{chatError}</Text> : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isOwn ? (
          <Text style={styles.ownNote}>This is your listing.</Text>
        ) : (
          <Button title="Chat với người bán" onPress={onChat} loading={opening} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xl },
  hero: { height: 220, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  heroText: { fontSize: 64, fontWeight: '800', color: colors.textMuted },
  body: { padding: spacing.lg },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  price: { fontSize: 22, fontWeight: '800', color: colors.primary, marginTop: spacing.xs },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  badge: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: { fontSize: 12, color: colors.textMuted, textTransform: 'capitalize' },
  desc: { fontSize: 15, color: colors.text, lineHeight: 22, marginTop: spacing.lg },
  descMuted: { fontSize: 15, color: colors.textMuted, marginTop: spacing.lg },
  error: { color: colors.danger, fontSize: 13, marginTop: spacing.md },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  ownNote: { textAlign: 'center', color: colors.textMuted, fontSize: 14 },
});
