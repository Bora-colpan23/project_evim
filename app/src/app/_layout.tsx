import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque';
import { HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold, HankenGrotesk_700Bold } from '@expo-google-fonts/hanken-grotesk';
import { hydrate } from '../domain/storage';
import { initLang } from '../domain/i18n';
import { boot } from '../domain/state';
import { AuthProvider } from '../auth/auth';
import { useColors } from '../ui/theme';

export default function Root() {
  const [fontsOk] = useFonts({
    BricolageGrotesque_800ExtraBold, HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold, HankenGrotesk_700Bold
  });
  const [stored, setStored] = useState(false);
  useEffect(() => {
    // Web'de sunucu HTML'i Türkçe üretilir; kayıtlı dil, hidrasyon bittikten sonra uygulanır
    // (aksi halde metinler sunucu çıktısıyla uyuşmaz).
    hydrate().then(() => {
      const apply = () => { initLang(); boot(); setStored(true); };
      if (Platform.OS === 'web') setTimeout(apply, 80); else apply();
    });
  }, []);
  const c = useColors();
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.backgroundColor = c.bg;
      document.documentElement.style.colorScheme = c.bg === '#141311' ? 'dark' : 'light';
    }
  }, [c.bg]);
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
