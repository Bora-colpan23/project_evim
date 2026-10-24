import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../auth/auth';
import { Button, Text } from '../../ui/kit';

export default function App() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  return (
    <View style={{ flex: 1, padding: 24, gap: 12, justifyContent: 'center' }}>
      <Text v="h1">Merhaba {user?.name}</Text>
      <Text muted>{user?.role}</Text>
      <Button kind="ghost" title="Çıkış" onPress={async () => { await signOut(); router.replace('/'); }} />
    </View>
  );
}
