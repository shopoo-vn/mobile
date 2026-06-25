import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useRegister } from '@/hooks/useAuth';
import { errorMessage } from '@/api/client';
import { colors, spacing } from '@/theme';
import { AuthStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;
interface FormValues {
  display_name: string;
  email: string;
  phone: string;
  password: string;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const register = useRegister();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { display_name: '', email: '', phone: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await register.mutateAsync({
        display_name: values.display_name,
        email: values.email,
        password: values.password,
        phone: values.phone.trim() || undefined,
      });
      // Auto-login on success (handled in useRegister) → RootNavigator swaps stacks.
    } catch (e) {
      setSubmitError(errorMessage(e, 'Could not create account'));
    }
  });

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Join the local marketplace for second-hand tech.</Text>

          <Controller
            control={control}
            name="display_name"
            rules={{
              required: 'Name is required',
              minLength: { value: 2, message: 'Name is too short' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Display name"
                placeholder="An Nguyen"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.display_name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email is required',
              pattern: { value: EMAIL_RE, message: 'Enter a valid email' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Email"
                placeholder="you@example.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            rules={{
              pattern: { value: /^[0-9+\s-]{8,15}$/, message: 'Enter a valid phone number' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Phone (optional)"
                placeholder="09xx xxx xxx"
                keyboardType="phone-pad"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.phone?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password is required',
              minLength: { value: 6, message: 'At least 6 characters' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Password"
                placeholder="••••••••"
                secureTextEntry
                textContentType="newPassword"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.password?.message}
              />
            )}
          />

          {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

          <Button
            title="Create account"
            onPress={onSubmit}
            loading={register.isPending}
            style={styles.primary}
          />
          <Button
            title="I already have an account"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={styles.secondary}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: spacing.xl, paddingBottom: spacing.xl },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm },
  primary: { marginTop: spacing.sm },
  secondary: { marginTop: spacing.md },
});
