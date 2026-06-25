import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { Loading } from '@/components/Loading';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useLogout } from '@/hooks/useAuth';
import { registerForPushNotifications } from '@/push/notifications';
import { errorMessage } from '@/api/client';
import { colors, radius, spacing } from '@/theme';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function ProfileScreen() {
  const { data: user, isLoading } = useProfile();
  const update = useUpdateProfile();
  const logout = useLogout();

  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    if (user) setName(user.display_name);
  }, [user]);

  if (isLoading || !user) {
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  }

  const saveName = async () => {
    if (name.trim().length < 2) return;
    try {
      await update.mutateAsync({ display_name: name.trim() });
      setEditing(false);
    } catch (e) {
      Alert.alert('Update failed', errorMessage(e));
    }
  };

  const enablePush = async () => {
    setPushBusy(true);
    const token = await registerForPushNotifications();
    setPushBusy(false);
    Alert.alert(
      token ? 'Notifications enabled' : 'Not enabled',
      token
        ? 'You will be alerted about new messages.'
        : 'Permission was denied, or push is unavailable on this device.',
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user.display_name[0] ?? '?').toUpperCase()}</Text>
        </View>

        {editing ? (
          <View style={styles.editBox}>
            <TextField label="Display name" value={name} onChangeText={setName} />
            <View style={styles.editActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => {
                  setName(user.display_name);
                  setEditing(false);
                }}
                style={styles.editBtn}
              />
              <Button
                title="Save"
                onPress={saveName}
                loading={update.isPending}
                style={styles.editBtn}
              />
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.name}>{user.display_name}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </>
        )}

        <View style={styles.card}>
          <Row label="Phone" value={user.phone ?? '—'} />
          <Row label="Role" value={user.role} />
          <Row label="Member since" value={new Date(user.created_at).toLocaleDateString('vi-VN')} />
        </View>

        {!editing ? (
          <Button
            title="Edit name"
            variant="secondary"
            onPress={() => setEditing(true)}
            style={styles.action}
          />
        ) : null}
        <Button
          title="Enable notifications"
          variant="secondary"
          onPress={enablePush}
          loading={pushBusy}
          style={styles.action}
        />
        <Button title="Sign out" variant="danger" onPress={() => void logout()} style={styles.action} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: spacing.xl, alignItems: 'stretch' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: colors.textMuted },
  name: { fontSize: 20, fontWeight: '700', color: colors.text, textAlign: 'center', marginTop: spacing.md },
  email: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs },
  editBox: { marginTop: spacing.lg },
  editActions: { flexDirection: 'row', gap: spacing.md },
  editBtn: { flex: 1 },
  card: {
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: { fontSize: 14, color: colors.textMuted },
  rowValue: { fontSize: 14, color: colors.text, fontWeight: '500', textTransform: 'capitalize' },
  action: { marginTop: spacing.md },
});
