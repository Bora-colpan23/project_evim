/* kiracım: küçük harfli, kalın, geometrik. İmza detayı "Anahtar Noktası":
   "i"nin noktası dolu daire değil, içi boş bir Kiremit anahtar halkasıdır; noktasız "ı" kapı gibi sade kalır.
   animate: açılışta halka "i"den "ı"nın üstüne sıçrar ve yerine oturur (600 ms). */
import { useEffect, useState } from 'react';
import { Text as RNText, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { fonts, useColors } from './theme';

export function Wordmark({ size = 28, color, animate }: { size?: number; color?: string; animate?: boolean }) {
  const c = useColors();
  const ink = color ?? c.ink;
  const [pos, setPos] = useState<{ a?: { x: number; w: number }; b?: { x: number; w: number } }>({});
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const ring = size * 0.2;
  const style = { fontFamily: fonts.siteBold, fontSize: size, lineHeight: size * 1.1, letterSpacing: -size * 0.03, color: ink } as const;

  useEffect(() => {
    if (!animate || !pos.a || !pos.b) return;
    const d = pos.b.x + pos.b.w / 2 - (pos.a.x + pos.a.w / 2);
    const ease = Easing.out(Easing.cubic);
    dx.value = withSequence(withTiming(d, { duration: 300, easing: ease }), withTiming(0, { duration: 300, easing: ease }));
    dy.value = withSequence(
      withTiming(-size * 0.3, { duration: 150, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 150, easing: Easing.in(Easing.quad) }),
      withTiming(-size * 0.3, { duration: 150, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 150, easing: Easing.in(Easing.quad) })
    );
  }, [animate, pos.a?.x, pos.b?.x]);

  const hop = useAnimatedStyle(() => ({ transform: [{ translateX: dx.value }, { translateY: dy.value }] }));

  return (
    <View accessibilityRole="header" accessibilityLabel="kiracım" style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
      <RNText style={style}>k</RNText>
      <View onLayout={(e) => { const l = e.nativeEvent.layout; setPos((p) => ({ ...p, a: { x: l.x, w: l.width } })); }}>
        <RNText style={style}>ı</RNText>
        <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: size * 0.08, alignItems: 'center' }, hop]}>
          <View style={{ width: ring, height: ring, borderRadius: ring / 2, borderWidth: Math.max(1.5, size * 0.065), borderColor: c.accent }} />
        </Animated.View>
      </View>
      <RNText style={style}>rac</RNText>
      <View onLayout={(e) => { const l = e.nativeEvent.layout; setPos((p) => ({ ...p, b: { x: l.x, w: l.width } })); }}>
        <RNText style={style}>ı</RNText>
      </View>
      <RNText style={style}>m</RNText>
    </View>
  );
}
