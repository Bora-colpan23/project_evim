import { Redirect, Slot } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '../../auth/auth';
import { useColors } from '../../ui/theme';

/** Kapı: yönetici paneli yalnızca admins tablosundaki hesaplara açılır. */
export default function AdminGate() {
  const { user, ready } = useAuth();
  const c = useColors();
  if (!ready) return <View style={{ flex: 1, backgroundColor: c.bg }} />;
  if (!user) return <Redirect href="/giris/yonetici" />;
  if (!user.admin) return <Redirect href="/uygulama" />;
  return <Slot />;
}
