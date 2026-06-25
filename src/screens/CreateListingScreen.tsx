import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Controller, useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useCreateListing } from '@/hooks/useListings';
import { fetchCategories } from '@/api/listings';
import { uploadImages, type PickedImage } from '@/api/media';
import { errorMessage } from '@/api/client';
import { Category, ListingCondition } from '@/types';
import { RootStackParamList } from '@/navigation/types';
import { colors, radius, spacing } from '@/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;
interface FormValues {
  title: string;
  description: string;
  price: string;
  location: string;
}

const CONDITIONS: { key: ListingCondition; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'like_new', label: 'Like new' },
  { key: 'used', label: 'Used' },
];

const MAX_IMAGES = 6;

export function CreateListingScreen() {
  const navigation = useNavigation<Nav>();
  const createListing = useCreateListing();
  const categories = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

  const [images, setImages] = useState<PickedImage[]>([]);
  const [condition, setCondition] = useState<ListingCondition>('used');
  const [categoryId, setCategoryId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { title: '', description: '', price: '', location: '' },
  });

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES,
      quality: 0.8,
    });
    if (result.canceled) return;
    const picked: PickedImage[] = result.assets.map((a) => ({
      uri: a.uri,
      fileName: a.fileName ?? null,
      mimeType: a.mimeType ?? null,
    }));
    setImages((prev) => [...prev, ...picked].slice(0, MAX_IMAGES));
  };

  const removeImage = (uri: string) => setImages((prev) => prev.filter((i) => i.uri !== uri));

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    if (!categoryId) {
      setFormError('Please choose a category.');
      return;
    }
    setSubmitting(true);
    try {
      let mediaIds: string[] = [];
      if (images.length > 0) {
        const uploaded = await uploadImages(images);
        mediaIds = uploaded.map((m) => m.id);
      }
      const created = await createListing.mutateAsync({
        title: values.title,
        description: values.description.trim() || undefined,
        price: Number(values.price),
        categoryId,
        location: values.location.trim() || undefined,
        condition,
        mediaIds,
      });
      reset();
      setImages([]);
      setCategoryId('');
      setCondition('used');
      Alert.alert('Listing submitted', 'It will appear once an admin approves it.');
      navigation.navigate('ListingDetail', { id: created.id });
    } catch (e) {
      setFormError(errorMessage(e, 'Could not create the listing'));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Screen noPadding>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.heading}>Post an item</Text>

          {/* Photos */}
          <Text style={styles.label}>Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoRow}>
            {images.map((img) => (
              <View key={img.uri} style={styles.photoWrap}>
                <Image source={{ uri: img.uri }} style={styles.photo} />
                <Pressable style={styles.removeBtn} onPress={() => removeImage(img.uri)}>
                  <Text style={styles.removeText}>×</Text>
                </Pressable>
              </View>
            ))}
            {images.length < MAX_IMAGES ? (
              <Pressable style={styles.addPhoto} onPress={pickImages}>
                <Text style={styles.addPhotoText}>＋</Text>
                <Text style={styles.addPhotoHint}>Add</Text>
              </Pressable>
            ) : null}
          </ScrollView>

          <Controller
            control={control}
            name="title"
            rules={{ required: 'Title is required', minLength: { value: 3, message: 'Too short' } }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Title"
                placeholder="iPhone 13 128GB"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.title?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="price"
            rules={{
              required: 'Price is required',
              pattern: { value: /^[0-9]+$/, message: 'Numbers only (VND)' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Price (VND)"
                placeholder="9500000"
                keyboardType="number-pad"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.price?.message}
              />
            )}
          />

          {/* Condition */}
          <Text style={styles.label}>Condition</Text>
          <View style={styles.chipRow}>
            {CONDITIONS.map((c) => (
              <Pressable
                key={c.key}
                onPress={() => setCondition(c.key)}
                style={[styles.chip, condition === c.key ? styles.chipActive : undefined]}
              >
                <Text style={[styles.chipText, condition === c.key ? styles.chipTextActive : undefined]}>
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Category */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.chipRow}>
            {(categories.data ?? []).map((cat: Category) => (
              <Pressable
                key={cat.id}
                onPress={() => setCategoryId(cat.id)}
                style={[styles.chip, categoryId === cat.id ? styles.chipActive : undefined]}
              >
                <Text style={[styles.chipText, categoryId === cat.id ? styles.chipTextActive : undefined]}>
                  {cat.name}
                </Text>
              </Pressable>
            ))}
            {categories.isLoading ? <Text style={styles.muted}>Loading categories…</Text> : null}
            {categories.isError ? <Text style={styles.muted}>Couldn’t load categories.</Text> : null}
          </View>

          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Location (district)"
                placeholder="Quận 1, HCMC"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Description"
                placeholder="Condition, accessories, reason for selling…"
                multiline
                numberOfLines={4}
                style={styles.multiline}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            )}
          />

          {formError ? <Text style={styles.error}>{formError}</Text> : null}

          <Button
            title="Submit listing"
            onPress={onSubmit}
            loading={submitting}
            style={styles.submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  heading: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  photoRow: { flexDirection: 'row', marginBottom: spacing.lg },
  photoWrap: { marginRight: spacing.sm },
  photo: { width: 84, height: 84, borderRadius: radius.sm, backgroundColor: colors.surface },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { color: '#fff', fontSize: 15, fontWeight: '700', lineHeight: 18 },
  addPhoto: {
    width: 84,
    height: 84,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: { fontSize: 24, color: colors.textMuted },
  addPhotoHint: { fontSize: 11, color: colors.textMuted },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
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
  muted: { fontSize: 13, color: colors.textMuted },
  multiline: { height: 100, textAlignVertical: 'top', paddingTop: spacing.sm },
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm },
  submit: { marginTop: spacing.sm },
});
