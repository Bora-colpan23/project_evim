import { ReactNode, useState } from 'react';
import {
  Pressable, PressableProps, StyleProp, StyleSheet, Text as RNText, TextInput, TextInputProps, TextStyle, View, ViewStyle
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { fonts, radius, useColors } from './theme';

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'label' | 'num';
const SCALE: Record<Variant, TextStyle> = {
  display: { fontFamily: fonts.display, fontSize: 56, lineHeight: 58, letterSpacing: -2 },
  h1: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44, letterSpacing: -1.4 },
  h2: { fontFamily: fonts.displayMid, fontSize: 28, lineHeight: 32, letterSpacing: -0.8 },
  h3: { fontFamily: fonts.displayMid, fontSize: 19, lineHeight: 24, letterSpacing: -0.3 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 25 },
  small: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fonts.bodyXBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.9, textTransform: 'uppercase' },
  num: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44, letterSpacing: -1.2 }
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

export function Button({ title, onPress, kind = 'primary', block, disabled, loading, style, icon }: {
  title: string; onPress?: () => void; kind?: 'primary' | 'dark' | 'ghost' | 'quiet' | 'onDark';
  block?: boolean; disabled?: boolean; loading?: boolean; style?: StyleProp<ViewStyle>; icon?: ReactNode;
}) {
  const c = useColors();
  const bg = kind === 'primary' ? c.accent : kind === 'dark' ? c.ink : 'transparent';
  const fg = kind === 'primary' ? c.accentInk : kind === 'dark' ? c.bg : kind === 'onDark' ? c.heroInk : c.ink;
  const border = kind === 'ghost' ? c.line : kind === 'onDark' ? '#5a554c' : 'transparent';
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityState={{ disabled: !!(disabled || loading) }}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        {
          minHeight: 48, paddingHorizontal: 22, borderRadius: radius.pill, backgroundColor: bg,
          borderWidth: 1, borderColor: border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          alignSelf: block ? 'stretch' : 'flex-start', opacity: disabled ? 0.5 : 1
        },
        style
      ]}
    >
      {icon}
      <RNText style={{ color: fg, fontFamily: fonts.bodyXBold, fontSize: 15 }}>{loading ? '…' : title}</RNText>
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
            minHeight: 50, borderRadius: radius.md, paddingHorizontal: 16, color: c.ink, backgroundColor: c.surface,
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
  return <View style={[{ width: '100%', maxWidth: 1240, alignSelf: 'center', paddingHorizontal: 20 }, style]}>{children}</View>;
}

export function Chip({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'ok' | 'bad' | 'warn' | 'accent' }) {
  const c = useColors();
  const map = {
    neutral: [c.surface2, c.ink], ok: [c.okBg, c.okInk], bad: [c.badBg, c.badInk], warn: [c.warnBg, c.warnInk], accent: [c.accentSoft, c.accent]
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' }}>
      <RNText style={{ color: fg, fontFamily: fonts.bodyXBold, fontSize: 12 }}>{label}</RNText>
    </View>
  );
}
