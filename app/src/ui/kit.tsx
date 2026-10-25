import { ReactNode, useEffect, useState } from 'react';
import {
  Platform, Pressable, PressableProps, StyleProp, StyleSheet, Text as RNText, TextInput, TextInputProps, TextStyle, View, ViewStyle
} from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { fonts, radius, useColors } from './theme';
import { Loader } from './Loader';

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'label' | 'num';
const SCALE: Record<Variant, TextStyle> = {
  // Başlık: Bricolage ExtraBold, satır aralığı %95. Alt başlık/gövde: Hanken Grotesk.
  display: { fontFamily: fonts.display, fontSize: 64, lineHeight: 61, letterSpacing: -2.2 },
  h1: { fontFamily: fonts.display, fontSize: 44, lineHeight: 42, letterSpacing: -1.4 },
  h2: { fontFamily: fonts.display, fontSize: 28, lineHeight: 28, letterSpacing: -0.7 },
  h3: { fontFamily: fonts.displayMid, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
  // Etiket ve rozet: Medium, 12 px, harf aralığı +%2
  label: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16, letterSpacing: 0.24, textTransform: 'uppercase' },
  // Rakam (kira tutarı): Bold, tabular
  num: { fontFamily: fonts.bodyBold, fontSize: 56, lineHeight: 60, letterSpacing: -1.5, fontVariant: ['tabular-nums'] }
};

export function Text({ v = 'body', muted, color, style, children, ...rest }: {
  v?: Variant; muted?: boolean; color?: string; style?: StyleProp<TextStyle>; children?: ReactNode;
} & Omit<React.ComponentProps<typeof RNText>, 'style'>) {
  const c = useColors();
  return (
    <RNText {...rest} style={[SCALE[v], { color: color ?? (muted ? c.muted : c.ink) }, style]}>
      {children}
    </RNText>
  );
}

const LAYOUT_KEYS = ['flex', 'flexGrow', 'flexShrink', 'flexBasis', 'alignSelf', 'width', 'maxWidth', 'minWidth', 'height', 'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'marginHorizontal', 'marginVertical'];

/** Tüm dokunulabilir yüzeyler: basınca anında yaylanarak küçülür (apple-design: tepki gecikmesiz).
    Yerleşim (flex, genişlik, kenar boşluğu) dış sarmalayıcıya, görünüm iç katmana gider. */
export function PressScale({ children, style, wrapStyle, scaleTo = 0.97, ...rest }: PressableProps & { scaleTo?: number; style?: StyleProp<ViewStyle>; wrapStyle?: StyleProp<ViewStyle> }) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const flat: any = StyleSheet.flatten(style) || {};
  const outer: any = {};
  const inner: any = {};
  Object.keys(flat).forEach((key) => { (LAYOUT_KEYS.includes(key) ? outer : inner)[key] = flat[key]; });
  // Dış sarmalayıcı genişlik/flex alıyorsa iç katman onu doldurur.
  const fill = outer.flex !== undefined || outer.flexGrow !== undefined || outer.width !== undefined || outer.alignSelf === 'stretch';
  return (
    <Pressable
      {...rest}
      style={[outer, wrapStyle]}
      onPressIn={(e) => { s.value = withSpring(scaleTo, { damping: 20, stiffness: 420 }); rest.onPressIn?.(e); }}
      onPressOut={(e) => { s.value = withSpring(1, { damping: 18, stiffness: 300 }); rest.onPressOut?.(e); }}
    >
      <Animated.View style={[a, fill ? { alignSelf: 'stretch', flexGrow: 1 } : null, inner]}>{children as ReactNode}</Animated.View>
    </Pressable>
  );
}

/** Mavi gradyan düğme (Uiverse): üzerine gelince gradyan kayar, içte ışıltılı gölge, odakta çift halka. */
const BLUE1 = 'hsla(194, 100%, 69%, 1)', BLUE2 = 'hsla(217, 100%, 56%, 1)';
function aquaStyle(hover: boolean, focus: boolean, off: boolean): any {
  const shadow = focus
    ? '0 0 0 3px #FFFFFF, 0 0 0 6px ' + BLUE2
    : '0px 0px 20px rgba(71,184,255,0.5), 0px 5px 5px -1px rgba(58,125,233,0.25), inset 4px 4px 8px rgba(175,230,255,0.5), inset -4px -4px 8px rgba(19,95,216,0.35)';
  const web: any = Platform.OS === 'web'
    ? { backgroundImage: `linear-gradient(325deg, ${BLUE2} 0%, ${BLUE1} 55%, ${BLUE2} 90%)`, backgroundSize: '280% auto', backgroundPosition: hover ? 'right top' : 'left top', transitionProperty: 'background-position', transitionDuration: '0.8s' }
    : null;
  return { borderRadius: 12, borderWidth: 0, boxShadow: shadow, opacity: off ? 0.6 : 1, ...web };
}

/** Düğmenin arkasında dönen, bulanık gradyan leke (pembe → mor → camgöbeği). Üzerine gelince küçülür. */
function GlowBlob({ hover }: { hover: boolean }) {
  const reduced = useReducedMotion();
  const rot = useSharedValue(0);
  const size = useSharedValue(160);
  useEffect(() => {
    if (reduced) return;
    rot.value = withRepeat(withTiming(360, { duration: 3000, easing: Easing.linear }), -1);
  }, [reduced, rot]);
  useEffect(() => { size.value = withTiming(hover ? 128 : 160, { duration: 400 }); }, [hover, size]);
  const a = useAnimatedStyle(() => ({ width: size.value, height: size.value, borderRadius: 999, transform: [{ rotate: rot.value + 'deg' }] }));
  const web: any = Platform.OS === 'web'
    ? { backgroundImage: 'linear-gradient(90deg, rgba(222,0,75,1) 0%, rgba(191,70,255,1) 49%, rgba(0,212,255,1) 100%)', filter: 'blur(20px)', opacity: 0.5 }
    : null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
      {web ? <Animated.View style={[web, a]} /> : (
        <Animated.View style={[{ opacity: 0.45 }, a]}>
          <Svg width="100%" height="100%" viewBox="0 0 100 100">
            <Defs><LinearGradient id="gb" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#DE004B" /><Stop offset="0.49" stopColor="#BF46FF" /><Stop offset="1" stopColor="#00D4FF" /></LinearGradient></Defs>
            <Circle cx="50" cy="50" r="40" fill="url(#gb)" />
          </Svg>
        </Animated.View>
      )}
    </View>
  );
}

export function Button({ title, onPress, kind = 'primary', block, disabled, loading, style, icon }: {
  title: string; onPress?: () => void; kind?: 'primary' | 'dark' | 'ghost' | 'quiet' | 'onDark' | 'glow' | 'aqua';
  block?: boolean; disabled?: boolean; loading?: boolean; style?: StyleProp<ViewStyle>; icon?: ReactNode;
}) {
  const c = useColors();
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const glow = kind === 'glow';
  const aqua = kind === 'aqua';
  const off = !!(disabled || loading);
  const bg = aqua ? '#3DA5FF' : glow ? (hover ? '#C1E4F8' : c.surface) : off && (kind === 'primary' || kind === 'dark') ? c.line6 : kind === 'primary' ? c.accent : kind === 'dark' ? c.ink : 'transparent';
  const fg = aqua ? '#FFFFFF' : glow ? (hover ? '#210055' : c.ink) : off && (kind === 'primary' || kind === 'dark') ? c.muted : kind === 'primary' ? c.accentInk : kind === 'dark' ? c.bg : kind === 'onDark' ? c.heroInk : c.ink;
  const border = kind === 'ghost' ? c.ink : kind === 'onDark' ? 'rgba(251,244,234,0.45)' : 'transparent';
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityState={{ disabled: !!(disabled || loading) }}
      disabled={disabled || loading}
      onPress={onPress}
      onHoverIn={glow || aqua ? () => setHover(true) : undefined}
      onHoverOut={glow || aqua ? () => setHover(false) : undefined}
      onFocus={aqua ? () => setFocus(true) : undefined}
      onBlur={aqua ? () => setFocus(false) : undefined}
      style={[
        {
          minHeight: 56, paddingHorizontal: 26, borderRadius: radius.pill, backgroundColor: bg,
          borderWidth: glow ? 0 : 1.5, borderColor: border,
          ...(aqua ? aquaStyle(hover, focus, off) : null),
          ...(glow ? { overflow: 'hidden' as const, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } } : null), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          alignSelf: block ? 'stretch' : 'flex-start'
        },
        style
      ]}
    >
      {glow ? <GlowBlob hover={hover} /> : null}
      {icon}
      {loading ? <Loader size={28} mono={fg} /> : <RNText style={{ color: fg, fontFamily: fonts.bodyBold, fontSize: 16 }}>{title}</RNText>}
    </PressScale>
  );
}

export function Field({ label, error, hint, ...rest }: TextInputProps & { label: string; error?: string | null; hint?: string }) {
  const c = useColors();
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ gap: 8 }}>
      <Text v="small" style={{ fontFamily: fonts.bodyBold }}>{label}</Text>
      <TextInput
        {...rest}
        accessibilityLabel={label}
        placeholderTextColor={c.muted}
        onFocus={(e) => { setFocus(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocus(false); rest.onBlur?.(e); }}
        style={[
          {
            minHeight: 52, borderRadius: radius.md, paddingHorizontal: 16, color: c.ink, backgroundColor: c.surface,
            borderWidth: 1.5, borderColor: error ? c.badInk : focus ? c.accent : c.line, fontFamily: fonts.body, fontSize: 16
          },
          // @ts-ignore web-only
          { outlineStyle: 'none' }
        ]}
      />
      {error ? <Text v="small" color={c.badInk}>{error}</Text> : hint ? <Text v="small" muted>{hint}</Text> : null}
    </View>
  );
}

/** Sayfa genişliğini sınırlar; yan boşluk her ekranda en az 20. */
export function Container({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ width: '100%', maxWidth: 1200, alignSelf: 'center', paddingHorizontal: 16 }, style]}>{children}</View>;
}

export function Chip({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'ok' | 'bad' | 'warn' | 'accent' }) {
  const c = useColors();
  const map = {
    neutral: [c.surface2, c.ink], ok: [c.okBg, c.okInk], bad: [c.badBg, c.badInk], warn: [c.warnBg, c.warnInk], accent: [c.accentSoft, c.accentText]
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' }}>
      <RNText style={{ color: fg, fontFamily: fonts.bodyMedium, fontSize: 12, letterSpacing: 0.24 }}>{label}</RNText>
    </View>
  );
}
