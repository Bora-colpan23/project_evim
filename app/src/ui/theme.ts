import { useEffect, useState, useSyncExternalStore } from 'react';
import { S, subscribe, snapshot } from '../domain/state';
import { useColorScheme, useWindowDimensions } from 'react-native';

/* Kiracım marka paleti (docs/marka-kimligi.md): Krem Duvar, Gece Mürekkebi, Kiremit, Nane Pervaz, Limon Perde, Lavanta Gölge. */
export const light = {
  bg: '#FBF4EA', surface: '#FFFCF7', surface2: '#F3EADC', line: '#EDE7E0',
  ink: '#121A3B', muted: '#5A6180', accent: '#FF5A2E', accentInk: '#FBF4EA', accentSoft: '#FFE2D7',
  /** Küçük metinde Kiremit (3:1'in altında) yerine okunur koyu ton. */
  accentText: '#C2360F',
  hero: '#121A3B', heroInk: '#FBF4EA', heroMuted: '#B8BCD6',
  okBg: '#BFE8D2', okInk: '#1B5A3B', badBg: '#FFD9CC', badInk: '#9A2A0B', warnBg: '#FFE98F', warnInk: '#5E4A00',
  shadow: 'rgba(18,26,59,0.10)',
  peach: '#FFDFD2', butter: '#FFD84A', sage: '#BFE8D2', sky: '#D8D0FF', rose: '#EFE6FF', cream: '#FBF4EA', deepA: '#121A3B', deepB: '#2B2F7A',
  lemon: '#FFD84A', mint: '#BFE8D2', lavender: '#D8D0FF', line6: 'rgba(18,26,59,0.06)'
};
export const dark: typeof light = {
  bg: '#0E1330', surface: '#161C42', surface2: '#1E2551', line: '#2A3263',
  ink: '#FBF4EA', muted: '#A9AECB', accent: '#FF6B42', accentInk: '#121A3B', accentSoft: '#4A2A28',
  accentText: '#FF8A68',
  hero: '#161C42', heroInk: '#FBF4EA', heroMuted: '#A9AECB',
  okBg: '#1E4A38', okInk: '#BFE8D2', badBg: '#4A2A28', badInk: '#FFC1AE', warnBg: '#4D4310', warnInk: '#FFE98F',
  shadow: 'rgba(0,0,0,0.5)',
  peach: '#4A2A28', butter: '#5A4C10', sage: '#1E4A38', sky: '#2D2A5E', rose: '#27224F', cream: '#0E1330', deepA: '#0A0E26', deepB: '#2B2F7A',
  lemon: '#FFD84A', mint: '#BFE8D2', lavender: '#D8D0FF', line6: 'rgba(251,244,234,0.08)'
};
export type Colors = typeof light;

export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayMid: 'HankenGrotesk_600SemiBold',
  body: 'HankenGrotesk_400Regular',
  bodyMedium: 'HankenGrotesk_500Medium',
  bodyBold: 'HankenGrotesk_700Bold',
  bodyXBold: 'HankenGrotesk_700Bold',
  site: 'BricolageGrotesque_800ExtraBold',
  siteBold: 'BricolageGrotesque_800ExtraBold'
};

export const radius = { sm: 12, md: 16, lg: 24, xl: 32, pill: 999 };
export const space = (n: number) => n * 4;

/** Tema: ilk çizim açık (statik HTML ile aynı), bağlanınca sistem temasına geçer. */
export function useColors(): Colors {
  const scheme = useColorScheme();
  useSyncExternalStore(subscribe, snapshot, snapshot);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return light;
  const pref = (S as any).theme;
  return pref === 'dark' || (pref !== 'light' && scheme === 'dark') ? dark : light;
}

/** Kırılım noktaları: telefon < 720 ≤ tablet < 1080 ≤ masaüstü.
    İlk çizim (statik HTML ve hidrasyon) sabit bir genişlikle yapılır; böylece sunucu ve
    istemci çıktısı aynı olur, ölçülen genişlik bağlanınca düzen güncellenir. */
export function useBreakpoint(){
  const { width: real } = useWindowDimensions();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const width = mounted ? real : 900;
  return { width, phone: width < 720, desktop: width >= 1080 };
}
