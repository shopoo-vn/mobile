import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, formatVnd, radius, spacing } from '@/theme';
import { Listing } from '@/types';

const CONDITION_LABEL: Record<string, string> = {
  new: 'New',
  like_new: 'Like new',
  used: 'Used',
};

interface ListingCardProps {
  listing: Listing;
  onPress: () => void;
}

// NOTE: listings carry mediaIds (not URLs); resolving them to thumbnails needs
// the Media Service URL contract finalized, so for now we show an initial-letter
// placeholder. The picked-image preview in Create Listing uses local URIs.
export function ListingCard({ listing, onPress }: ListingCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : undefined]}
    >
      <View style={styles.thumb}>
        <Text style={styles.thumbText}>{(listing.title[0] ?? '?').toUpperCase()}</Text>
      </View>
      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.title}>
          {listing.title}
        </Text>
        <Text style={styles.price}>{formatVnd(listing.price)}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta} numberOfLines={1}>
            {[listing.location, CONDITION_LABEL[listing.condition] ?? listing.condition]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  pressed: { opacity: 0.85 },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbText: { fontSize: 26, fontWeight: '700', color: colors.textMuted },
  body: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '600', color: colors.text },
  price: { fontSize: 15, fontWeight: '700', color: colors.primary, marginTop: spacing.xs },
  metaRow: { marginTop: spacing.xs },
  meta: { fontSize: 12, color: colors.textMuted },
});
