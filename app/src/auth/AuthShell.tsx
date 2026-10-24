import { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { t } from '../domain/i18n';
import { PressScale, Text } from '../ui/kit';
import { radius, useBreakpoint, useColors } from '../ui/theme';

/** Giriş, kayıt ve şifre ekranlarının ortak iskeleti: geniş ekranda solda marka paneli. */
export default function AuthShell({ title, lead, children }: { title: string; lead?: string; children: ReactNode }) {
  const c = useColors();
  const router = useRouter();
  const { desktop } = useBreakpoint();
  return (
    <View style={{ flex: 1, flexDirection: desktop ? 'row' : 'column', backgroundColor: c.bg }}>
      {desktop && (
        <View style={{ flex: 0.8, backgroundColor: c.hero, padding: 56, justifyContent: 'space-between' }}>
          <PressScale onPress={() => router.replace('/')} accessibilityRole="link"><Text v="h2" color={c.heroInk}>Kiracım</Text></PressScale>
          <View style={{ gap: 16, maxWidth: 440 }}>
            <Text v="h1" color={c.heroInk}>{t('Kira takibi, iki taraf için tek yerde')}</Text>
            <Text v="body" color={c.heroMuted}>{t('Kiracılar ücretsiz. Mülk sahipleri 14 gün kartsız dener.')}</Text>
          </View>
          <Text v="small" color={c.heroMuted}>{t('Konut, ofis, mağaza ve depo')}</Text>
        </View>
      )}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20, paddingVertical: 40 }} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.springify().damping(22).stiffness(130)} style={{ width: '100%', maxWidth: 440, alignSelf: 'center', gap: 22 }}>
          {!desktop && <PressScale onPress={() => router.replace('/')} accessibilityRole="link"><Text v="h3">Kiracım</Text></PressScale>}
          <View style={{ gap: 8 }}>
            <Text v="h1" style={{ fontSize: 32, lineHeight: 36 }}>{title}</Text>
            {lead ? <Text v="body" muted>{lead}</Text> : null}
          </View>
          <View style={{ gap: 16, backgroundColor: c.surface, padding: 22, borderRadius: radius.lg, borderWidth: 1, borderColor: c.line }}>{children}</View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
