import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { ListingCard } from '@/components/ListingCard';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { useListingsFeed } from '@/hooks/useListings';
import type { ListingSort } from '@/api/listings';
import { Listing, ListingCondition } from '@/types';
import { RootStackParamList } from '@/navigation/types';
import { colors, radius, spacing } from '@/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type ConditionFilter = ListingCondition | 'all';

const CONDITIONS: { key: ConditionFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'like_new', label: 'Like new' },
  { key: 'used', label: 'Used' },
];

const SORTS: { key: ListingSort; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'price_asc', label: 'Price ↑' },
  { key: 'price_desc', label: 'Price ↓' },
];

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : undefined]}
    >
      <Text style={[styles.chipText, active ? styles.chipTextActive : undefined]}>{label}</Text>
    </Pressable>
  );
}

export function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [condition, setCondition] = useState<ConditionFilter>('all');
  const [sort, setSort] = useState<ListingSort>('newest');

  const filters = useMemo(
    () => ({
      q: query.trim() || undefined,
      condition: condition === 'all' ? undefined : condition,
      sort,
    }),
    [query, condition, sort],
  );

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useListingsFeed(filters);

  const listings = data?.pages.flatMap((p) => p.items) ?? [];

  const renderItem = useCallback(
    ({ item }: { item: Listing }) => (
      <ListingCard
        listing={item}
        onPress={() => navigation.navigate('ListingDetail', { id: item.id })}
      />
    ),
    [navigation],
  );

  const header = (
    <View style={styles.header}>
      <TextInput
        style={styles.search}
        placeholder="Search phones, laptops, …"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        returnKeyType="search"
        value={text}
        onChangeText={setText}
        onSubmitEditing={() => setQuery(text)}
      />
      <View style={styles.chipRow}>
        {CONDITIONS.map((c) => (
          <Chip
            key={c.key}
            label={c.label}
            active={condition === c.key}
            onPress={() => setCondition(c.key)}
          />
        ))}
      </View>
      <View style={styles.chipRow}>
        {SORTS.map((s) => (
          <Chip key={s.key} label={s.label} active={sort === s.key} onPress={() => setSort(s.key)} />
        ))}
      </View>
    </View>
  );

  return (
    <Screen noPadding>
      <FlatList
        data={listings}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        ListHeaderComponent={header}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        onRefresh={() => void refetch()}
        refreshing={isRefetching}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          isLoading ? (
            <Loading />
          ) : isError ? (
            <EmptyState title="Search failed" actionLabel="Retry" onAction={() => void refetch()} />
          ) : (
            <EmptyState title="No results" message="Try a different keyword or filter." />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, flexGrow: 1 },
  header: { marginBottom: spacing.md },
  search: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.bg,
    marginBottom: spacing.md,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.text },
  chipTextActive: { color: colors.primaryText, fontWeight: '600' },
});
