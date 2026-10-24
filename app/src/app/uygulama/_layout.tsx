import { Redirect, Slot } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '../../auth/auth';
import AppShell from '../../app-ui/AppShell';
import { useColors } from '../../ui/theme';

/** Kapı: uygulama yalnızca oturumla açılır. */
export default function Gate() {
  const { user, ready } = useAuth();
  const c = useColors();
  if (!ready) return <View style={{ flex: 1, backgroundColor: c.bg }} />;
  if (!user) return <Redirect href="/giris" />;
  return <AppShell><Slot /></AppShell>;
}
