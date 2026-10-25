/* Tanıtım sayfası. Yön: yumuşak yuvarlak sans, pastel renk alanları, çok yuvarlak çerçeveler,
   hap biçimli arayüz parçaları ve koyu eğrili bir alan (referans marka çalışmasının dili, Kiracım paletiyle). */
import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOutUp } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { t, getLang, setLang } from '../domain/i18n';
import { CONFIG } from '../domain/config';
import { Button, Chip, Container, PressScale, Text } from '../ui/kit';
import { Wordmark } from '../ui/Wordmark';
import { fonts, radius, useBreakpoint, useColors } from '../ui/theme';
import { Slam } from '../ui/motion';
import { useHeroCards } from './HeroCards';
import { useLangTick } from '../app-ui/hooks';
import { Icon, Steps } from '../app-ui/blocks';
import { features, planPoints, plans } from './content';
import { Nav, TopBar } from './Navbar';
import { FeatureCarousel } from './Carousel';
import { Grain } from '../ui/Grain';

/** Web'de CSS degrade, yerel uygulamada düz renk. */
const grad = (css: string, fallback: string): any => (Platform.OS === 'web' ? { backgroundColor: fallback, backgroundImage: css } : { backgroundColor: fallback });

const enter = (i: number) => FadeInDown.delay(60 + i * 80).springify().damping(22).stiffness(120);

/** Site başlık yazısı: yuvarlak geometrik sans, sıkı iz. */
function D({ children, size, color, style }: { children: any; size: number; color?: string; style?: any }) {
  const c = useColors();
  return <RNText style={[{ fontFamily: fonts.siteBold, fontSize: size, lineHeight: Math.round(size * 1.04), letterSpacing: -size * 0.02, color: color ?? c.ink }, style]}>{children}</RNText>;
}


/** Başlıkta tek sözcük/ifade Kiremit ile vurgulanır (marka dili: tek vurgu). */
function Title({ text, mark, size, color, accent }: { text: string; mark?: string; size: number; color?: string; accent?: string }) {
  const c = useColors();
  const i = mark ? text.indexOf(mark) : -1;
  const base = { fontFamily: fonts.siteBold, fontSize: size, lineHeight: Math.round(size * 1.04), letterSpacing: -size * 0.02, color: color ?? c.ink };
  if (i < 0) return <RNText accessibilityRole="header" style={base}>{text}</RNText>;
  return (
    <RNText accessibilityRole="header" style={base}>
      {text.slice(0, i)}<RNText style={{ color: accent ?? c.accent }}>{mark}</RNText>{text.slice((mark as string).length + i)}
    </RNText>
  );
}

/** Süper grafik: logodaki "Anahtar Noktası" halkasının dev, ince çizgili hali.
    Halkanın üstünde tek dolu Kiremit nokta durur; kimlik bu tek detaydan yayılır. */
function RingGraphic({ size, stroke, dot = true, angle = -40, style }: { size: number; stroke: string; dot?: boolean; angle?: number; style?: any }) {
  const r = size / 2 - 3;
  const a = (angle * Math.PI) / 180;
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[{ position: 'absolute', width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={stroke} strokeWidth={2} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r * 0.72} stroke={stroke} strokeWidth={2} fill="none" strokeOpacity={0.55} />
        {dot && <Circle cx={size / 2 + r * Math.cos(a)} cy={size / 2 + r * Math.sin(a)} r={Math.max(7, size * 0.022)} fill="#FF5A2E" />}
      </Svg>
    </View>
  );
}

/** Kil dokulu simge: yumuşak degrade, üst kenarda ışık, katmanlı gölge (3B clay objelerin sade karşılığı). */
function Clay({ icon, base, light, size = 56 }: { icon: string; base: string; light: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.34, alignItems: 'center', justifyContent: 'center',
      ...grad(`linear-gradient(150deg, ${light} 0%, ${base} 70%)`, base),
      boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.7), inset 0 -4px 8px rgba(18,26,59,0.10), 0 10px 18px -6px rgba(18,26,59,0.28)' } as any}>
      <Icon name={icon} size={Math.round(size * 0.42)} color="#121A3B" />
    </View>
  );
}

/** Cam pencere: koyu zeminde buzlu cam kare; yanınca Limon Perde ışığı sızar. */
function GlassWindow({ lit, size }: { lit: boolean; size: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.26, borderWidth: 1, borderColor: lit ? 'rgba(255,216,74,0.7)' : 'rgba(251,244,234,0.22)',
      ...grad(lit ? 'linear-gradient(150deg, #FFE88A 0%, #FFD84A 55%, #E8B923 100%)' : 'linear-gradient(150deg, rgba(251,244,234,0.20), rgba(251,244,234,0.03))', lit ? '#FFD84A' : 'rgba(251,244,234,0.08)'),
      boxShadow: lit ? '0 0 28px rgba(255,216,74,0.45), inset 0 1px 0 rgba(255,255,255,0.8)' : 'inset 0 1px 0 rgba(255,255,255,0.28)' } as any} />
  );
}

function Logo({ onDark, animate }: { onDark?: boolean; animate?: boolean }) {
  const c = useColors();
  return <Wordmark size={28} color={onDark ? c.heroInk : undefined} animate={animate} />;
}

/** Hap biçimli arayüz parçası (başlık içinde noktalama gibi durur). */
function Pill({ children, bg, fg, size }: { children: any; bg: string; fg: string; size: number }) {
  return (
    <View style={{ height: size, borderRadius: size / 2, paddingHorizontal: size * 0.34, backgroundColor: bg, flexDirection: 'row', alignItems: 'center', gap: size * 0.18, alignSelf: 'center', marginVertical: 2 }}>
      {children}
    </View>
  );
}

/** İç içe geçen yumuşak halkalar: odak parçasını vurgular. */
function Rings({ color, children }: { color: string; children: any }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: 4 }}>
      {[0.22, 0.4, 0.62].map((o, i) => (
        <View key={i} pointerEvents="none" style={{ position: 'absolute', top: -(i + 1) * 14, bottom: -(i + 1) * 14, left: -(i + 1) * 14, right: -(i + 1) * 14, borderRadius: 999, backgroundColor: color, opacity: o * 0.7 }} />
      ))}
      {children}
    </View>
  );
}

/** "Gün ışığı": Krem Duvar → Lavanta Gölge, 160°, yumuşak ve bulanık geçiş. */
function Daylight() {
  const c = useColors();
  return (
    <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 400 300" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
      <Defs>
        <LinearGradient id="dl" x1="0.3" y1="0" x2="0.7" y2="1"><Stop offset="0" stopColor={c.cream} /><Stop offset="1" stopColor={c.lavender} /></LinearGradient>
      </Defs>
      <Rect width="400" height="300" fill="url(#dl)" />
      <Path d="M-10 250 C 90 200, 200 290, 420 210 L 420 310 L -10 310 Z" fill={c.lavender} opacity={0.55} />
      <Path d="M260 -10 C 300 60, 360 40, 420 90 L 420 -10 Z" fill={c.lemon} opacity={0.35} />
    </Svg>
  );
}

function Hero({ go, scrollTo }: { go: (p: string) => void; scrollTo: (k: string) => void }) {
  const c = useColors();
  const { phone, width } = useBreakpoint();
  const wide = width >= 1100;
  const size = phone ? 44 : wide ? 76 : 72;
  const pill = Math.round(size * 0.7);
  const mk = useHeroCards(wide ? 248 : 232);
  const text = (
    <View style={{ flex: wide ? 1 : undefined, alignItems: 'center', gap: 22, paddingVertical: wide ? 28 : 0 }}>
      <Animated.View entering={enter(0)}><Chip tone="neutral" label={t('Kiracılar için ücretsiz')} /></Animated.View>
      <View style={{ alignItems: 'center', gap: 2 }}>
        <Animated.View entering={enter(1)} style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: size * 0.12 }}>
          <Slam delay={150} height={Math.round(size * 1.12)}><D size={size}>{t('Kira işi,')}</D></Slam>
          <Pill bg={c.surface} fg={c.ink} size={pill}>
            <View style={{ width: pill * 0.4, height: pill * 0.4, borderRadius: pill * 0.1, backgroundColor: c.lemon }} />
            <RNText style={{ fontFamily: fonts.bodyBold, fontSize: pill * 0.4, color: c.ink }}>{t('Ödendi')}</RNText>
          </Pill>
        </Animated.View>
        <Slam delay={320} height={Math.round(size * 1.12)}><D size={size}>{t('ev kadar')}</D></Slam>
        <Slam delay={490} height={Math.round(size * 1.12)}><D size={size} color={c.accent}>{t('rahat.')}</D></Slam>
      </View>
      <Animated.View entering={enter(4)} style={{ alignItems: 'center', gap: 18, maxWidth: 520 }}>
        <Text v="body" style={{ fontSize: phone ? 16 : 18, lineHeight: phone ? 24 : 27, textAlign: 'center' }}>
          {t('Sözleşme, ödeme, depozito ve arıza yazışması tek uygulamada. Kiracı ve mülk sahibi aynı kayda iki taraftan bakar.')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
          {[['check', t('Kiracılar ücretsiz')], ['card', t('Kartsız 14 gün deneme')], ['home', t('Konut, ofis, mağaza, depo')]].map(([ic, l]) => (
            <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.surface, borderRadius: radius.pill, borderWidth: 1, borderColor: c.line, paddingHorizontal: 12, paddingVertical: 7 }}>
              <Icon name={ic} size={15} />
              <RNText style={{ fontFamily: fonts.bodyBold, fontSize: 13, color: c.ink }}>{l}</RNText>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button kind="primary" title={t('Ücretsiz başla')} onPress={() => go('/kayit')} />
          <Button kind="ghost" title={t('Fiyatları gör')} onPress={() => scrollTo('fiyat')} />
        </View>
      </Animated.View>
    </View>
  );
  return (
    <Container style={{ paddingTop: phone ? 10 : 18 }}>
      <View style={{ borderRadius: phone ? 32 : 40, padding: phone ? 22 : 48, overflow: 'hidden', backgroundColor: c.cream }}>
        <Daylight />
        <RingGraphic size={phone ? 360 : wide ? 760 : 560} stroke="rgba(18,26,59,0.14)" angle={phone ? -50 : -35} style={{ right: phone ? -150 : -230, top: phone ? -170 : -260 }} />
        {wide ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 36 }}>
            <View style={{ gap: 22, marginTop: -30 }}>{mk('l1').odeme}{mk('l2').yazisma}</View>
            {text}
            <View style={{ gap: 22, marginTop: 30 }}>{mk('r1').talep}{mk('r2').depozito}</View>
          </View>
        ) : (
          <View style={{ gap: 32 }}>
            {text}
            <Animated.View entering={FadeInUp.delay(380).springify().damping(20)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
              {[mk('a').odeme, mk('b').talep, mk('c').yazisma, mk('d').depozito]}
            </Animated.View>
          </View>
        )}
      </View>
    </Container>
  );
}

/** Tasarım manifestosu: beş kısa cümle, dev yazı. */
function Manifesto() {
  const c = useColors();
  const { phone } = useBreakpoint();
  const lines = [t('Ev, bir adres değil bir duygudur.'), t('Kira, bir yük değil bir düzendir.'), t('Her ay bir pencere yanar.'), t('Net yaz, yumuşak davran.'), t('Sayı büyük, söz kısa.')];
  return (
    <Container style={{ paddingTop: phone ? 56 : 112 }}>
      <View style={{ backgroundColor: c.lavender, borderRadius: phone ? 32 : 40, padding: phone ? 24 : 56, gap: phone ? 10 : 16 }}>
        <Text v="label" color={c.ink}>{t('Kiracım böyle düşünür')}</Text>
        {lines.map((l, i) => (
          <Animated.View key={l} entering={FadeInDown.delay(i * 80).duration(280)}>
            <D size={phone ? 26 : 56} color={i === 2 ? c.accent : c.ink}>{l}</D>
          </Animated.View>
        ))}
      </View>
    </Container>
  );
}

/** Koyu, eğrili alan: dönen sözcükle ne takip edildiğini söyler. */
function Words() {
  const { phone } = useBreakpoint();
  const list = [t('Ödemeler'), t('Talepler'), t('Belgeler'), t('Tutanak'), t('Depozito'), t('Giderler'), t('Yenileme')];
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((x) => (x + 1) % list.length), 1900); return () => clearInterval(id); }, [list.length]);
  const c = useColors();
  const size = phone ? 52 : 120;
  return (
    <Container style={{ paddingTop: phone ? 14 : 24 }}>
      <View style={{ borderRadius: phone ? 32 : 48, overflow: 'hidden', backgroundColor: c.deepA, minHeight: phone ? 340 : 520, justifyContent: 'center' }}>
        <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1000 600" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <Defs>
            <LinearGradient id="g" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={c.deepA} /><Stop offset="1" stopColor={c.deepB} /></LinearGradient>
          </Defs>
          <Rect width="1000" height="600" fill="url(#g)" />
          <Path d="M-20 430 C 220 360, 430 520, 700 400 S 1000 330, 1040 360" stroke="#fff" strokeOpacity={0.14} strokeWidth={2} fill="none" />
          <Path d="M-20 480 C 240 420, 470 560, 720 450 S 1000 400, 1040 420" stroke="#fff" strokeOpacity={0.09} strokeWidth={2} fill="none" />
          <Path d="M620 -20 C 700 140, 560 260, 760 420" stroke="#fff" strokeOpacity={0.12} strokeWidth={2} fill="none" />
        </Svg>
        <Grain />
        <RingGraphic size={phone ? 300 : 520} stroke="rgba(251,244,234,0.13)" angle={-60} style={{ right: phone ? -120 : -90, top: phone ? -90 : -120 }} />
        <View style={{ padding: phone ? 26 : 64, gap: phone ? 6 : 14 }}>
          <Text v="label" color="#E8B9A6">{t('Tek yerde')}</Text>
          <View style={{ height: size * 1.12, justifyContent: 'center' }}>
            <Animated.View key={list[i]} entering={FadeInDown.springify().damping(20).stiffness(160)} exiting={FadeOutUp.duration(160)} style={{ position: 'absolute' }}>
              <D size={size} color="#FFF3EA">{list[i]}</D>
            </Animated.View>
          </View>
          <Text v="body" color="#E8CFC2" style={{ maxWidth: 520, fontSize: phone ? 16 : 19, lineHeight: phone ? 24 : 28 }}>{t('Kiranın tüm işi, ödemeden çıkışa.')}</Text>
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: phone ? 8 : 12, marginTop: phone ? 18 : 30, maxWidth: phone ? 6 * 48 : 12 * 62 }}>
            {Array.from({ length: 12 }).map((_, k) => <GlassWindow key={k} size={phone ? 40 : 50} lit={k < Math.round(((i + 1) / list.length) * 12)} />)}
          </View>
        </View>
      </View>
    </Container>
  );
}

/** Pastel renkli, çok yuvarlak özellik kartları; her birinin içinde küçük bir arayüz parçası. */
function FeatureTile({ bg, title, body, children, flex = 1 }: { bg: string; title: string; body: string; children?: any; flex?: number }) {
  return (
    <View style={{ flex, minWidth: 240, backgroundColor: bg, borderRadius: 36, padding: 28, gap: 18, justifyContent: 'space-between', minHeight: 300 }}>
      <View style={{ flex: 1, justifyContent: 'center' }}>{children}</View>
      <View style={{ gap: 8 }}>
        <D size={28}>{title}</D>
        <Text v="body" style={{ fontSize: 16, lineHeight: 24 }}>{body}</Text>
      </View>
    </View>
  );
}

function Features({ onLayout, go }: { onLayout: (y: number) => void; go: (p: string) => void }) {
  const c = useColors();
  const { desktop, phone } = useBreakpoint();
  const big = features();
  return (
    <View onLayout={(e) => onLayout(e.nativeEvent.layout.y)}>
      <Container style={{ paddingTop: phone ? 56 : 112, gap: phone ? 28 : 48 }}>
        <View style={{ maxWidth: 760, gap: 12 }}>
          <Text v="label" color={c.accentText}>{t('Özellikler')}</Text>
          <Title size={phone ? 36 : 68} text={t('Kiranın tüm işi, ödemeden çıkışa.')} mark={t('ödemeden çıkışa.')} />
        </View>
        <View style={{ flexDirection: desktop ? 'row' : 'column', gap: 16 }}>
          <FeatureTile flex={1.35} bg={c.sky} title={big[0].title} body={big[0].body}>
            <View style={{ gap: 10 }}>
              {[[t('Kasım'), 'ok', t('Ödendi')], [t('Ekim'), 'ok', t('Ödendi')], [t('Eylül'), 'warn', t('Kısmi ödeme')]].map(([m, tone, l]) => (
                <View key={m} style={{ backgroundColor: c.surface, borderRadius: radius.pill, paddingHorizontal: 20, minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text v="small" style={{ fontFamily: fonts.bodyXBold }}>{m} 2026</Text><View><Chip tone={tone as any} label={l} /></View>
                </View>
              ))}
            </View>
          </FeatureTile>
          <FeatureTile bg={c.butter} title={big[1].title} body={big[1].body}>
            <View style={{ backgroundColor: c.surface, borderRadius: 28, padding: 18, gap: 12 }}>
              <Text v="small" style={{ fontFamily: fonts.bodyXBold }}>{t('Kombi basıncı düşüyor')}</Text>
              <Steps status={1} labels={[t('Açıldı'), t('Görüldü'), t('İşlemde'), t('Çözüldü')]} />
            </View>
          </FeatureTile>
        </View>
        <View style={{ flexDirection: desktop ? 'row' : 'column', gap: 16 }}>
          <FeatureTile bg={c.sage} title={big[2].title} body={big[2].body}>
            <View style={{ backgroundColor: c.surface, borderRadius: 28, padding: 18, gap: 8 }}>
              {[[t('Depozito'), '₺65.000'], [t('Kesintiler'), '− ₺4.200'], [t('İade edilecek'), '₺60.800']].map(([k, v], i) => (
                <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text v="small" muted={i < 2}>{k}</Text><Text v="small" style={{ fontFamily: fonts.bodyXBold }}>{v}</Text></View>
              ))}
            </View>
          </FeatureTile>
          <FeatureTile flex={1.35} bg={c.peach} title={big[3].title} body={big[3].body}>
            <Rings color={c.surface}>
              <View style={{ backgroundColor: c.surface, borderRadius: radius.pill, paddingHorizontal: 22, minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: c.accent }} />
                <RNText style={{ fontFamily: fonts.site, fontSize: 20, color: c.accent, letterSpacing: -0.4 }}>{t('Yasal üst sınır: TÜFE')}</RNText>
              </View>
            </Rings>
          </FeatureTile>
        </View>
        <FeatureCarousel go={go} />
      </Container>
    </View>
  );
}


/** Nasıl çalışır: üç adım ve iki tarafın ne yaptığı, düz anlatım. */
/** Çerçeve (outline) adım numarası: web'de içi boş, çizgili; yerel uygulamada soluk dolgu. */
function Outline({ n }: { n: string }) {
  const c = useColors();
  const rgb = c.ink === '#121A3B' ? '18,26,59' : '251,244,234';
  const web: any = Platform.OS === 'web' ? { color: 'transparent', WebkitTextStroke: `1.5px rgba(${rgb},0.42)` } : { color: `rgba(${rgb},0.18)` };
  return <Text accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[{ fontFamily: fonts.display, fontSize: 96, lineHeight: 92, letterSpacing: -2 }, web]}>{n}</Text>;
}

function How() {
  const c = useColors();
  const { desktop, phone } = useBreakpoint();
  const steps: [string, string, string, string, string][] = [
    ['01', t('Hesap aç'), t('Kiracı hesabı ücretsizdir. Mülk sahibi hesabı 14 gün kartsız denenir.'), c.sky, t('Kiracıysan ev sahibinden gelen davet bağlantısıyla kayıt ol.')],
    ['02', t('Mülkü ekle, kiracıyı davet et'), t('Mülk sahibi mülkü ekler ve davet bağlantısı ya da kodu kiracıya gönderir. Kiracı kayıt olunca mülke bağlanır.'), c.butter, t('Davet kodunu mesajla da gönderebilirsin.')],
    ['03', t('Birlikte takip edin'), t('Dekont, talep, belge ve tutanak tek kayıtta durur. Aynı kaydı iki taraf da kendi ekranında görür.'), c.sage, t('Sorun olursa yazışmaya fotoğraf ekle, görsel anlatsın.')]
  ];
  const lists: [string, string, string[]][] = [
    [t('Kiracı için'), c.peach, [t('Kira ve ödeme durumunu görür, dekont yükler'), t('Arıza ve tadilat talebi açar, durumunu izler'), t('Mesajlaşır, belgelerine ve giriş tutanağına bakar'), t('Sözleşme yenileme teklifini kabul eder ya da görüşmeye çağırır')]],
    [t('Mülk sahibi için'), c.rose, [t('Tüm mülklerini ve kiracılarını tek ekranda görür'), t('Dekontu onaylar, talepleri ilerletir, teklifleri karşılaştırır'), t('Gider defteri, net getiri ve vergi tahminine bakar'), t('Çıkışta kesintileri girer, depozito iadesini hesaplar')]]
  ];
  return (
    <Container style={{ paddingTop: phone ? 56 : 112, gap: phone ? 28 : 48 }}>
      <View style={{ maxWidth: 760, gap: 12 }}>
        <Text v="label" color={c.accentText}>{t('Nasıl çalışır')}</Text>
        <D size={phone ? 36 : 68}>{t('Üç adımda başla.')}</D>
      </View>
      <View style={{ flexDirection: desktop ? 'row' : 'column', gap: 16 }}>
        {steps.map(([n, title, body, bg, tip]) => (
          <View key={n} style={{ flex: 1, backgroundColor: bg, borderRadius: 36, padding: 28, gap: 14, minHeight: 240, overflow: 'hidden' }}>
            <Outline n={n} />
            <D size={26}>{title}</D>
            <Text v="body" style={{ fontSize: 16, lineHeight: 24 }}>{body}</Text>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 'auto' as any }}>
              <View style={{ backgroundColor: '#121A3B', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 }}>
                <Text v="label" color="#FBF4EA" style={{ fontFamily: fonts.bodyBold }}>{t('İpucu')}</Text>
              </View>
              <Text v="small" style={{ flex: 1, fontFamily: fonts.bodyMedium }}>{tip}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: desktop ? 'row' : 'column', gap: 16 }}>
        {lists.map(([title, bg, items]) => (
          <View key={title} style={{ flex: 1, backgroundColor: bg, borderRadius: 36, padding: 28, gap: 14 }}>
            <D size={28}>{title}</D>
            <View style={{ gap: 10 }}>
              {items.map((x) => (
                <View key={x} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                  <Text v="body" color={c.accentText} style={{ fontFamily: fonts.bodyXBold, lineHeight: 24 }}>•</Text>
                  <Text v="body" style={{ flex: 1, fontSize: 16, lineHeight: 24 }}>{x}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
      <View style={{ backgroundColor: c.surface, borderRadius: 28, borderWidth: 1, borderColor: c.line, padding: 22 }}>
        <Text v="body" style={{ fontSize: 16, lineHeight: 24 }}>{t('Yüklenen dekont, belge ve faturalar Kiracım ekibince kontrol edilir; onaylanınca karşı tarafa görünür. Reddedilirse yükleyen gerekçesiyle birlikte haber alır.')}</Text>
      </View>
    </Container>
  );
}


/** Güven: kutusuz, açık düzen; üstte ince çizgi, kil dokulu simge, kısa metin. */
function Trust() {
  const c = useColors();
  const { phone, width } = useBreakpoint();
  const items: [string, string, string, string, string][] = [
    ['check', t('Onaylı yüklemeler'), t('Dekont, belge ve faturalar Kiracım ekibince kontrol edilir; onaylanana kadar karşı tarafa görünmez.'), c.mint, '#E3F7EC'],
    ['key', t('Sana özel erişim'), t('Herkes yalnızca bağlı olduğu mülkün kaydını görür. Kurallar veritabanı katmanında uygulanır.'), c.lavender, '#EEEAFF'],
    ['doc', t('Kayıtlı işlemler'), t('Yöneticinin yaptığı her hassas işlem, yazışma incelemeleri dahil, değiştirilemez bir kayda yazılır.'), c.lemon, '#FFEE9E'],
    ['safe', t('Verin sende'), t('Verini JSON olarak dışa aktarabilir, hesabını uygulama içinden silebilirsin.'), '#FFB9A3', '#FFDDD0']
  ];
  return (
    <Container style={{ paddingTop: phone ? 56 : 112, gap: phone ? 28 : 48 }}>
      <View style={{ maxWidth: 760, gap: 12 }}>
        <Text v="label" color={c.accentText}>{t('Güven')}</Text>
        <Title size={phone ? 36 : 68} text={t('Bilgilerin güvende.')} mark={t('güvende.')} />
        <Text v="body" muted style={{ maxWidth: 620, fontSize: 17 }}>{t('Kira kaydı kişisel bilgidir. Bu yüzden kimin neyi gördüğü baştan belli ve denetimlidir.')}</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: phone ? 28 : 36 }}>
        {items.map(([ic, title, body, base, light]) => (
          <View key={title} style={{ flexGrow: 1, flexBasis: width >= 1000 ? 200 : 260, borderTopWidth: 1.5, borderTopColor: c.ink, paddingTop: 22, gap: 14 }}>
            <Clay icon={ic} base={base} light={light} />
            <RNText accessibilityRole="header" style={{ fontFamily: fonts.siteBold, fontSize: 24, lineHeight: 28, letterSpacing: -0.5, color: c.ink }}>{title}</RNText>
            <Text v="small" muted style={{ fontSize: 15, lineHeight: 22 }}>{body}</Text>
          </View>
        ))}
      </View>
    </Container>
  );
}

/** Sık sorulanlar: solda başlık, sağda ince çizgili akordeon. Tek soru açık kalır. */
function Faq({ onLayout }: { onLayout: (y: number) => void }) {
  const c = useColors();
  const { phone, desktop } = useBreakpoint();
  const [open, setOpen] = useState(0);
  const qa: [string, string][] = [
    [t('Kiracım nedir?'), t('Kiracı ile mülk sahibinin ödeme, dekont, talep, belge, depozito ve yazışmayı tek yerde tuttuğu bir uygulamadır. İki taraf aynı kayda kendi ekranından bakar.')],
    [t('Kiracı olarak ücret öder miyim?'), t('Hayır. Kiracı hesapları her zaman ücretsizdir.')],
    [t('Mülk sahibi hesabı nasıl çalışır?'), t('14 gün kartsız denersin. Süre bitince aylık ya da yıllık aboneliğe geçersin; abone olmazsan kayıtlar salt okunur olur, okuma ve mesajlaşma açık kalır.')],
    [t('Yüklediğim dekontu karşı taraf ne zaman görür?'), t('Dekont, belge ve faturalar Kiracım ekibince kontrol edilir. Onaylanınca karşı tarafa görünür; reddedilirse gerekçesiyle sana döner.')],
    [t('Konut dışında da kullanabilir miyim?'), t('Evet. Konut, ofis, mağaza ve depo seçilebilir; tutanak alanları ve belge kategorileri mülk tipine göre gelir.')],
    [t('Yazışmalarımı kim okuyabilir?'), t('Yalnızca evin kiracısı ve mülk sahibi. Güvenlik ve şikâyet incelemesi gerektiğinde yetkili yönetici de açabilir; her inceleme değiştirilemez bir kayda yazılır.')],
    [t('Hesabımı nasıl silerim?'), t('Ayarlardan hesabı silersin; hesabın ve verilerin kalıcı olarak silinir. Önce verini JSON olarak dışa aktarabilirsin.')]
  ];
  return (
    <View onLayout={(e) => onLayout(e.nativeEvent.layout.y)}>
      <Container style={{ paddingTop: phone ? 56 : 112, flexDirection: desktop ? 'row' : 'column', gap: phone ? 24 : 64 }}>
        <View style={{ flex: desktop ? 0.8 : undefined, gap: 12 }}>
          <Text v="label" color={c.accentText}>{t('SSS')}</Text>
          <Title size={phone ? 36 : 56} text={t('Sıkça sorulan sorular')} mark={t('sorular')} />
          <Pressable accessibilityRole="link" onPress={() => Linking.openURL(CONFIG.legal.support)} style={{ minHeight: 44, justifyContent: 'center' }}>
            <RNText style={{ fontFamily: fonts.bodyBold, fontSize: 15, color: c.accentText, textDecorationLine: 'underline' }}>{t('Daha fazla bilgi için destek sayfamıza ulaşabilirsin.')}</RNText>
          </Pressable>
        </View>
        <View style={{ flex: 1.3 }}>
          {qa.map(([q, a], i) => {
            const on = open === i;
            return (
              <View key={q} style={{ borderTopWidth: 1.5, borderTopColor: c.ink, ...(i === qa.length - 1 ? { borderBottomWidth: 1.5, borderBottomColor: c.ink } : null) }}>
                <Pressable accessibilityRole="button" aria-expanded={on} accessibilityState={{ expanded: on }} onPress={() => setOpen(on ? -1 : i)}
                  style={{ minHeight: 68, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingVertical: 14 }}>
                  <RNText style={{ flex: 1, fontFamily: fonts.siteBold, fontSize: phone ? 18 : 22, lineHeight: phone ? 23 : 27, letterSpacing: -0.4, color: c.ink }}>{q}</RNText>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: on ? c.accent : c.surface2, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ position: 'absolute', width: 14, height: 2, borderRadius: 1, backgroundColor: c.ink }} />
                    {!on && <View style={{ position: 'absolute', width: 2, height: 14, borderRadius: 1, backgroundColor: c.ink }} />}
                  </View>
                </Pressable>
                {on && (
                  <Animated.View entering={FadeIn.duration(220)} style={{ paddingBottom: 24, paddingRight: 52 }}>
                    <Text v="body" muted style={{ fontSize: 16, lineHeight: 25 }}>{a}</Text>
                  </Animated.View>
                )}
              </View>
            );
          })}
        </View>
      </Container>
    </View>
  );
}

function Pricing({ go, onLayout }: { go: (p: string) => void; onLayout: (y: number) => void }) {
  const c = useColors();
  const { desktop, phone } = useBreakpoint();
  return (
    <View onLayout={(e) => onLayout(e.nativeEvent.layout.y)}>
      <Container style={{ paddingTop: phone ? 56 : 112, gap: phone ? 28 : 48 }}>
        <View style={{ maxWidth: 820, gap: 12 }}>
          <Text v="label" color={c.accentText}>{t('Fiyatlar')}</Text>
          <Title size={phone ? 36 : 68} text={t('Kiracı ücretsiz. Mülk sahibi aylık ya da yıllık.')} mark={t('Kiracı ücretsiz.')} />
          <Text v="body" muted style={{ maxWidth: 620, fontSize: 17 }}>{t('Mülk sahibi hesapları 14 gün kartsız denenir. Süre bitince kayıtlar salt okunur olur; kiracının işleri hiç etkilenmez.')}</Text>
        </View>
        <View style={{ flexDirection: desktop ? 'row' : 'column', gap: 16, alignItems: 'stretch' }}>
          <View style={{ flex: 0.8, backgroundColor: c.sage, borderRadius: 36, padding: 30, gap: 14 }}>
            <D size={26}>{t('Kiracı')}</D>
            <D size={54}>{t('Ücretsiz')}</D>
            <Text v="body" style={{ fontSize: 16 }}>{t('Dekont yükle, talep aç, mesaj yaz, belgelerine bak. Her zaman.')}</Text>
            <View style={{ flex: 1, minHeight: 20 }} />
            <Button kind="primary" block title={t('Kiracı olarak kayıt ol')} onPress={() => go('/kayit/kiraci')} style={{ minHeight: 52 }} />
          </View>
          {plans().map((p) => (
            <View key={p.id} style={{ flex: 1, backgroundColor: p.best ? c.deepA : c.surface, borderRadius: 36, padding: 30, gap: 14, borderWidth: p.best ? 0 : 1, borderColor: c.line, overflow: 'hidden' }}>
              {p.best && (
                <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 400 600" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                  <Defs><LinearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={c.deepA} /><Stop offset="1" stopColor={c.deepB} /></LinearGradient></Defs>
                  <Rect width="400" height="600" fill="url(#pg)" />
                  <Path d="M-10 470 C 120 410, 240 530, 410 440" stroke="#fff" strokeOpacity={0.14} strokeWidth={2} fill="none" />
                </Svg>
              )}
              {p.best && <Grain />}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <D size={26} color={p.best ? '#FFF3EA' : c.ink}>{t('Mülk sahibi')} · {p.name}</D>
                {p.best && <Chip tone="warn" label={p.note} />}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <D size={54} color={p.best ? '#FFF3EA' : c.ink}>{p.price}</D>
                <Text v="small" color={p.best ? '#E8CFC2' : c.muted}>{p.per}</Text>
              </View>
              {!p.best && <Text v="small" muted>{p.note}</Text>}
              <View style={{ gap: 10, marginVertical: 6 }}>
                {planPoints().map((x) => (
                  <View key={x} style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: p.best ? '#E8B9A6' : c.accent, marginTop: 7 }} />
                    <Text v="small" color={p.best ? '#E8CFC2' : c.muted} style={{ flex: 1 }}>{x}</Text>
                  </View>
                ))}
              </View>
              <View style={{ flex: 1, minHeight: 10 }} />
              <Button kind="primary" block title={t('14 gün ücretsiz dene')} onPress={() => go('/kayit/mulk-sahibi')} style={{ minHeight: 52 }} />
            </View>
          ))}
        </View>
      </Container>
    </View>
  );
}

function Contact({ onLayout }: { onLayout: (y: number) => void }) {
  const c = useColors();
  const { desktop, phone } = useBreakpoint();
  const mail = () => Linking.openURL('mailto:' + CONFIG.supportEmail).catch(() => {});
  return (
    <View onLayout={(e) => onLayout(e.nativeEvent.layout.y)}>
      <Container style={{ paddingTop: phone ? 56 : 112, paddingBottom: phone ? 20 : 40 }}>
        <View style={{ backgroundColor: c.butter, borderRadius: phone ? 32 : 48, padding: phone ? 26 : 64, gap: 26, overflow: 'hidden' }}>
          <RingGraphic size={phone ? 280 : 520} stroke="rgba(18,26,59,0.16)" angle={-125} style={{ right: phone ? -110 : -140, bottom: phone ? -140 : -220 }} />
          <Text v="label" color={c.ink}>{t('İletişim')}</Text>
          <D size={phone ? 40 : 96}>{t('Soruların için yaz.')}</D>
          <View style={{ flexDirection: desktop ? 'row' : 'column', gap: 24, justifyContent: 'space-between', alignItems: desktop ? 'flex-end' : 'flex-start' }}>
            <View style={{ gap: 10, maxWidth: 520 }}>
              <PressScale onPress={mail} accessibilityRole="link"><D size={phone ? 24 : 40} color={c.accent}>{CONFIG.supportEmail}</D></PressScale>
              <Text v="body" style={{ fontSize: 16 }}>{t('Hesap, abonelik ve veri silme işlemleri için destek sayfasına ya da e-postaya ulaşabilirsin.')}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              <Button kind="dark" title={t('E-posta gönder')} onPress={mail} style={{ minHeight: 52, paddingHorizontal: 28 }} />
              <Button kind="ghost" title={t('Destek sayfası')} onPress={() => Linking.openURL(CONFIG.legal.support)} style={{ minHeight: 52, paddingHorizontal: 28, backgroundColor: 'rgba(255,255,255,0.55)' }} />
            </View>
          </View>
        </View>
      </Container>
    </View>
  );
}

function Footer() {
  const c = useColors();
  const lang = getLang();
  const items: [string, string][] = [[t('Kullanım Koşulları'), CONFIG.legal.terms], [t('Gizlilik ve KVKK'), CONFIG.legal.privacy], [t('Hesap silme'), CONFIG.legal.deletion]];
  return (
    <Container style={{ paddingTop: 20, paddingBottom: 96 }}>
      <View style={{ backgroundColor: c.hero, borderRadius: 36, paddingHorizontal: 28, paddingVertical: 22, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
        <Logo onDark />
        <View style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {[['tr', 'Türkçe'], ['en', 'English']].map(([code, name]) => (
            <PressScale key={code} accessibilityRole="button" accessibilityState={{ selected: lang === code }} onPress={() => { setLang(code); if (typeof location !== 'undefined') location.reload(); }} style={{ minHeight: 44, minWidth: 48, justifyContent: 'center' }}>
              <Text v="small" color={lang === code ? c.heroInk : c.heroMuted} style={{ fontFamily: lang === code ? fonts.bodyXBold : fonts.body }}>{name}</Text>
            </PressScale>
          ))}
          {items.map(([l, u]) => (
            <PressScale key={u} accessibilityRole="link" onPress={() => Linking.openURL(u)} style={{ minHeight: 44, justifyContent: 'center' }}>
              <Text v="small" color={c.heroMuted}>{l}</Text>
            </PressScale>
          ))}
        </View>
      </View>
    </Container>
  );
}

export default function Landing() {
  useLangTick();
  const c = useColors();
  const router = useRouter();
  const ref = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const ys = useRef<Record<string, number>>({});
  const go = (p: string) => router.push(p as any);
  const scrollTo = (k: string) => ref.current?.scrollTo({ y: Math.max(0, (ys.current[k] ?? 0) - 90), animated: true });
  return (
    <View style={{ flex: 1 }}>
    <ScrollView ref={ref} style={{ flex: 1, backgroundColor: c.cream }} contentContainerStyle={{ flexGrow: 1 }} stickyHeaderIndices={[1]}>
      <TopBar />
      <Nav go={go} scrollTo={scrollTo} />
      <Hero go={go} scrollTo={scrollTo} />
      <Words />
      <Manifesto />
      <Features go={go} onLayout={(y) => (ys.current.ozellikler = y)} />
      <How />
      <Trust />
      <Pricing go={go} onLayout={(y) => (ys.current.fiyat = y)} />
      <Faq onLayout={(y) => (ys.current.sss = y)} />
      <Contact onLayout={(y) => (ys.current.iletisim = y)} />
      <Footer />
    </ScrollView>
    <View pointerEvents="box-none" style={{ position: 'absolute', right: 18, bottom: 18 }}>
      <Button kind="primary" title={t('Ücretsiz başla')} onPress={() => go('/kayit')} style={{ minHeight: 52 }} />
    </View>
    </View>
  );
}
