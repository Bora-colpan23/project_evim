import { useEffect, useState } from 'react';
import { Platform, View, useColorScheme } from 'react-native';
import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import { BricolageGrotesque_600SemiBold, BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque';
import { Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { hydrate } from '../domain/storage';
import { initLang } from '../domain/i18n';
import { boot } from '../domain/state';
import { AuthProvider } from '../auth/auth';
import { dark, light } from '../ui/theme';

export default function Root() {
  const [fontsOk] = useFonts({
    BricolageGrotesque_600SemiBold, BricolageGrotesque_700Bold, Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold
  });
  const [stored, setStored] = useState(false);
  const scheme = useColorScheme();
  useEffect(() => { hydrate().then(() => { initLang(); boot(); setStored(true); }); }, []);
  const c = scheme === 'dark' ? dark : light;
  // Web'de içerik hemen çizilir (statik dışa aktarma dolu HTML üretir); yazı tipi gelince değişir.
  if (Platform.OS !== 'web' && (!fontsOk || !stored)) return <View style={{ flex: 1, backgroundColor: c.bg }} />;
  return (
    <AuthProvider>
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <Slot />
      </View>
    </AuthProvider>
  );
}
