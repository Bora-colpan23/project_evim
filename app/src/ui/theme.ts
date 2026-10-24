import { useEffect, useState, useSyncExternalStore } from 'react';
import { S, subscribe, snapshot } from '../domain/state';
import { useColorScheme, useWindowDimensions } from 'react-native';

export const light = {
  bg: '#F6F5F2', surface: '#FFFFFF', surface2: '#EFEDE8', line: '#E4E1DA',
  ink: '#1B1A17', muted: '#68635A', accent: '#A8492A', accentInk: '#FFFFFF', accentSoft: '#F6E3DA',
  hero: '#1B1A17', heroInk: '#F6F5F2', heroMuted: '#B9B3A8',
  okBg: '#E1EEDD', okInk: '#2B5A33', badBg: '#F7D9D2', badInk: '#862A19', warnBg: '#F6E8C8', warnInk: '#6B4A0B',
  shadow: 'rgba(27,26,23,0.10)'
};
export const dark: typeof light = {
  bg: '#141311', surface: '#1D1B18', surface2: '#27241F', line: '#34302A',
  ink: '#F1EDE5', muted: '#A9A196', accent: '#E58B66', accentInk: '#1A130F', accentSoft: '#3A2A20',
  hero: '#1D1B18', heroInk: '#F1EDE5', heroMuted: '#A9A196',
  okBg: '#223326', okInk: '#BEE0C3', badBg: '#44241D', badInk: '#F4C0B3', warnBg: '#3F3217', warnInk: '#F0D79B',
  shadow: 'rgba(0,0,0,0.45)'
};
export type Colors = typeof light;

export const fonts = {
  display: 'BricolageGrotesque_700Bold',
  displayMid: 'BricolageGrotesque_600SemiBold',
  body: 'Manrope_500Medium',
  bodyBold: 'Manrope_700Bold',
  bodyXBold: 'Manrope_800ExtraBold'
};

export const radius = { sm: 10, md: 16, lg: 24, xl: 32, pill: 999 };
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
