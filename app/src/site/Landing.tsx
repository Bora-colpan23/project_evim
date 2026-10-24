/* Tanıtım sayfası. Yön: yumuşak yuvarlak sans, pastel renk alanları, çok yuvarlak çerçeveler,
   hap biçimli arayüz parçaları ve koyu eğrili bir alan (referans marka çalışmasının dili, Kiracım paletiyle). */
import { useEffect, useRef, useState } from 'react';
import { Linking, ScrollView, Text as RNText, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, FadeOutUp } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { t, getLang, setLang } from '../domain/i18n';
import { CONFIG } from '../domain/config';
import { Button, Chip, Container, PressScale, Text } from '../ui/kit';
import { Wordmark } from '../ui/Wordmark';
import { MonthStrip } from '../ui/Facade';
import { fonts, radius, useBreakpoint, useColors } from '../ui/theme';
import { Slam } from '../ui/motion';
import { useLangTick } from '../app-ui/hooks';
import { Steps } from '../app-ui/blocks';
import { features, more, planPoints, plans } from './content';

const enter = (i: number) => FadeInDown.delay(60 + i * 80).springify().damping(22).stiffness(120);

/** Site başlık yazısı: yuvarlak geometrik sans, sıkı iz. */
function D({ children, size, color, style }: { children: any; size: number; color?: string; style?: any }) {
  const c = useColors();
  return <RNText style={[{ fontFamily: fonts.siteBold, fontSize: size, lineHeight: Math.round(size * 1.04), letterSpacing: -size * 0.035, color: color ?? c.ink }, style]}>{children}</RNText>;
}

function Logo({ onDark, animate }: { onDark?: boolean; animate?: boolean }) {
  const c = useColors();
  return <Wordmark size={28} color={onDark ? c.heroInk : undefined} animate={animate} />;
}

/** Yüzen hap biçimli gezinme: ekranın üstünde yapışık, yuvarlak ve beyaz. */
function Nav({ go, scrollTo }: { go: (p: string) => void; scrollTo: (k: string) => void }) {
  const c = useColors();
  const { phone } = useBreakpoint();
  return (
    <View style={{ paddingTop: 14, paddingBottom: 6, backgroundColor: c.cream }}>
      <Container>
        <View style={{ minHeight: 64, borderRadius: radius.pill, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, paddingLeft: phone ? 14 : 22, paddingRight: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {phone ? <Wordmark size={22} animate /> : <Logo animate />}
          {!phone && (
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[['ozellikler', t('Özellikler')], ['fiyat', t('Fiyatlar')], ['iletisim', t('İletişim')]].map(([k, l]) => (
                <PressScale key={k} onPress={() => scrollTo(k)} accessibilityRole="link" style={{ paddingVertical: 10, paddingHorizontal: 16 }}>
                  <Text v="small" style={{ fontFamily: fonts.bodyXBold }}>{l}</Text>
                </PressScale>
              ))}
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
            <Button kind="quiet" title={t('Giriş yap')} onPress={() => go('/giris')} style={phone ? { paddingHorizontal: 10, minHeight: 44 } : undefined} />
            <Button title={t('Kayıt ol')} onPress={() => go('/kayit')} style={phone ? { paddingHorizontal: 14, minHeight: 44 } : undefined} />
          </View>
        </View>
      </Container>
    </View>
  );
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

function RentCard() {
  const c = useColors();
  return (
    <View style={{ backgroundColor: c.hero, borderRadius: 24, padding: 22, gap: 10, flex: 1, minWidth: 240 }}>
      <Text v="label" color={c.heroMuted}>{t('Kasım kirası')}</Text>
      <Text v="num" color={c.heroInk}>₺32.500</Text>
      <MonthStrip onDark kinds={['lit', 'lit', 'lit', 'lit', 'lit', 'lit', 'lit', 'lit', 'lit', 'lit', 'mint', 'off']} />
      <Text v="small" color={c.heroMuted}>{t('5 Kasım · 12 gün kaldı')}</Text>
      <View style={{ marginTop: 6 }}><Button title={t('Dekont yükle')} onPress={() => {}} /></View>
    </View>
  );
}

function Hero({ go, scrollTo }: { go: (p: string) => void; scrollTo: (k: string) => void }) {
  const c = useColors();
  const { desktop, phone } = useBreakpoint();
  const size = phone ? 46 : desktop ? 104 : 76;
  const pill = Math.round(size * 0.7);
  return (
    <Container style={{ paddingTop: phone ? 10 : 18 }}>
      <View style={{ borderRadius: phone ? 32 : 40, padding: phone ? 22 : 56, gap: phone ? 28 : 44, overflow: 'hidden', backgroundColor: c.cream }}>
        <Daylight />
        <View style={{ gap: 6 }}>
          <Animated.View entering={enter(0)} style={{ marginBottom: 14 }}><Chip tone="neutral" label={t('Kiracılar için ücretsiz')} /></Animated.View>
          <Animated.View entering={enter(1)} style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: size * 0.12 }}>
            <Slam delay={150} height={Math.round(size * 1.12)}><D size={size}>{t('Kira işi,')}</D></Slam>
            <Pill bg={c.surface} fg={c.ink} size={pill}>
              <View style={{ width: pill * 0.4, height: pill * 0.4, borderRadius: pill * 0.1, backgroundColor: c.lemon }} />
              <RNText style={{ fontFamily: fonts.bodyBold, fontSize: pill * 0.4, color: c.ink }}>{t('Ödendi')}</RNText>
            </Pill>
          </Animated.View>
          <Slam delay={320} height={Math.round(size * 1.12)}><D size={size}>{t('ev kadar')}</D></Slam>
          <Slam delay={490} height={Math.round(size * 1.12)}><D size={size} color={c.accentText}>{t('rahat.')}</D></Slam>
        </View>

        <View style={{ flexDirection: desktop ? 'row' : 'column', gap: desktop ? 56 : 28, alignItems: desktop ? 'flex-end' : 'stretch', justifyContent: 'space-between' }}>
          <Animated.View entering={enter(4)} style={{ maxWidth: 520, gap: 22 }}>
            <Text v="body" style={{ fontSize: phone ? 17 : 20, lineHeight: phone ? 26 : 30 }}>
              {t('Sözleşme, ödeme, depozito ve arıza yazışması tek uygulamada. Kiracı ve mülk sahibi aynı kayda iki taraftan bakar.')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              <Button title={t('Ücretsiz başla')} onPress={() => go('/kayit')} />
              <Button kind="ghost" title={t('Fiyatları gör')} onPress={() => scrollTo('fiyat')} />
            </View>
            <Text v="small" muted>{t('Mülk sahipleri 14 gün kartsız dener. Konut, ofis, mağaza ve depo.')}</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(380).springify().damping(20)} style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap', flex: desktop ? 1 : undefined, maxWidth: desktop ? 640 : undefined, justifyContent: desktop ? 'flex-end' : 'flex-start' }}>
            <RentCard />
            <View style={{ flex: 1, minWidth: 220, gap: 14 }}>
              <View style={{ backgroundColor: c.surface, borderRadius: 24, padding: 18, gap: 10, borderWidth: 1, borderColor: c.line }}>
                <Text v="small" style={{ fontFamily: fonts.bodyBold }}>{t('Kombi basıncı düşüyor')}</Text>
                <Steps status={2} labels={[t('Açıldı'), t('Görüldü'), t('İşlemde'), t('Çözüldü')]} />
              </View>
              <View style={{ backgroundColor: c.lemon, borderRadius: 24, padding: 18, gap: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text v="small" color="#121A3B" style={{ fontFamily: fonts.bodyBold }}>{t('Sözleşme yenileme')}</Text><Chip label={t('52 gün')} tone="neutral" /></View>
                <Text v="small" color="#121A3B">{t('Artış, 12 aylık TÜFE ortalamasıyla sınırlı. İki taraf aynı hesabı görür.')}</Text>
              </View>
            </View>
          </Animated.View>
        </View>
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
            <D size={phone ? 26 : 56} color={i === 2 ? c.accentText : c.ink}>{l}</D>
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
        <View style={{ padding: phone ? 26 : 64, gap: phone ? 6 : 14 }}>
          <Text v="label" color="#E8B9A6">{t('Tek yerde')}</Text>
          <View style={{ height: size * 1.12, justifyContent: 'center' }}>
            <Animated.View key={list[i]} entering={FadeInDown.springify().damping(20).stiffness(160)} exiting={FadeOutUp.duration(160)} style={{ position: 'absolute' }}>
              <D size={size} color="#FFF3EA">{list[i]}</D>
            </Animated.View>
          </View>
          <Text v="body" color="#E8CFC2" style={{ maxWidth: 520, fontSize: phone ? 16 : 19, lineHeight: phone ? 24 : 28 }}>{t('Kiranın tüm işi, ödemeden çıkışa.')}</Text>
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

function Features({ onLayout }: { onLayout: (y: number) => void }) {
  const c = useColors();
  const { desktop, phone } = useBreakpoint();
  const big = features();
  const rest = more();
  return (
    <View onLayout={(e) => onLayout(e.nativeEvent.layout.y)}>
      <Container style={{ paddingTop: phone ? 56 : 112, gap: phone ? 28 : 48 }}>
        <View style={{ maxWidth: 760, gap: 12 }}>
          <Text v="label" color={c.accentText}>{t('Özellikler')}</Text>
          <D size={phone ? 36 : 68}>{t('Kiranın tüm işi, ödemeden çıkışa.')}</D>
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
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {rest.map((m) => (
            <View key={m.title} style={{ backgroundColor: c.surface, borderRadius: 28, borderWidth: 1, borderColor: c.line, padding: 20, gap: 6, flexGrow: 1, flexBasis: phone ? '100%' : desktop ? '23%' : '46%' }}>
              <D size={20}>{m.title}</D>
              <Text v="small" muted>{m.body}</Text>
            </View>
          ))}
        </View>
      </Container>
    </View>
  );
}


/** Nasıl çalışır: üç adım ve iki tarafın ne yaptığı, düz anlatım. */
function How() {
  const c = useColors();
  const { desktop, phone } = useBreakpoint();
  const steps: [string, string, string, string][] = [
    ['1', t('Hesap aç'), t('Kiracı hesabı ücretsizdir. Mülk sahibi hesabı 14 gün kartsız denenir.'), c.sky],
    ['2', t('Mülkü ekle, kiracıyı davet et'), t('Mülk sahibi mülkü ekler ve davet bağlantısı ya da kodu kiracıya gönderir. Kiracı kayıt olunca mülke bağlanır.'), c.butter],
    ['3', t('Birlikte takip edin'), t('Dekont, talep, belge ve tutanak tek kayıtta durur. Aynı kaydı iki taraf da kendi ekranında görür.'), c.sage]
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
        {steps.map(([n, title, body, bg]) => (
          <View key={n} style={{ flex: 1, backgroundColor: bg, borderRadius: 36, padding: 28, gap: 14, minHeight: 240 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
              <D size={22}>{n}</D>
            </View>
            <D size={26}>{title}</D>
            <Text v="body" style={{ fontSize: 16, lineHeight: 24 }}>{body}</Text>
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

function Pricing({ go, onLayout }: { go: (p: string) => void; onLayout: (y: number) => void }) {
  const c = useColors();
  const { desktop, phone } = useBreakpoint();
  return (
    <View onLayout={(e) => onLayout(e.nativeEvent.layout.y)}>
      <Container style={{ paddingTop: phone ? 56 : 112, gap: phone ? 28 : 48 }}>
        <View style={{ maxWidth: 820, gap: 12 }}>
          <Text v="label" color={c.accentText}>{t('Fiyatlar')}</Text>
          <D size={phone ? 36 : 68}>{t('Kiracı ücretsiz. Mülk sahibi aylık ya da yıllık.')}</D>
          <Text v="body" muted style={{ maxWidth: 620, fontSize: 17 }}>{t('Mülk sahibi hesapları 14 gün kartsız denenir. Süre bitince kayıtlar salt okunur olur; kiracının işleri hiç etkilenmez.')}</Text>
        </View>
        <View style={{ flexDirection: desktop ? 'row' : 'column', gap: 16, alignItems: 'stretch' }}>
          <View style={{ flex: 0.8, backgroundColor: c.sage, borderRadius: 36, padding: 30, gap: 14 }}>
            <D size={26}>{t('Kiracı')}</D>
            <D size={54}>{t('Ücretsiz')}</D>
            <Text v="body" style={{ fontSize: 16 }}>{t('Dekont yükle, talep aç, mesaj yaz, belgelerine bak. Her zaman.')}</Text>
            <View style={{ flex: 1, minHeight: 20 }} />
            <Button kind="dark" block title={t('Kiracı olarak kayıt ol')} onPress={() => go('/kayit/kiraci')} style={{ minHeight: 56 }} />
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
              <Button kind={p.best ? 'primary' : 'dark'} block title={t('14 gün ücretsiz dene')} onPress={() => go('/kayit/mulk-sahibi')} style={{ minHeight: 56 }} />
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
        <View style={{ backgroundColor: c.butter, borderRadius: phone ? 32 : 48, padding: phone ? 26 : 64, gap: 26 }}>
          <Text v="label" color={c.ink}>{t('İletişim')}</Text>
          <D size={phone ? 40 : 96}>{t('Soruların için yaz.')}</D>
          <View style={{ flexDirection: desktop ? 'row' : 'column', gap: 24, justifyContent: 'space-between', alignItems: desktop ? 'flex-end' : 'flex-start' }}>
            <View style={{ gap: 10, maxWidth: 520 }}>
              <PressScale onPress={mail} accessibilityRole="link"><D size={phone ? 24 : 40} color={c.accent}>{CONFIG.supportEmail}</D></PressScale>
              <Text v="body" style={{ fontSize: 16 }}>{t('Hesap, abonelik ve veri silme işlemleri için destek sayfasına ya da e-postaya ulaşabilirsin.')}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              <Button kind="dark" title={t('E-posta gönder')} onPress={mail} style={{ minHeight: 56, paddingHorizontal: 28 }} />
              <Button kind="ghost" title={t('Destek sayfası')} onPress={() => Linking.openURL(CONFIG.legal.support)} style={{ minHeight: 56, paddingHorizontal: 28, backgroundColor: 'rgba(255,255,255,0.55)' }} />
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
            <PressScale key={code} accessibilityRole="button" accessibilityState={{ selected: lang === code }} onPress={() => { setLang(code); if (typeof location !== 'undefined') location.reload(); }} style={{ paddingVertical: 8 }}>
              <Text v="small" color={lang === code ? c.heroInk : c.heroMuted} style={{ fontFamily: lang === code ? fonts.bodyXBold : fonts.body }}>{name}</Text>
            </PressScale>
          ))}
          {items.map(([l, u]) => (
            <PressScale key={u} accessibilityRole="link" onPress={() => Linking.openURL(u)} style={{ paddingVertical: 8 }}>
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
    <ScrollView ref={ref} style={{ flex: 1, backgroundColor: c.cream }} contentContainerStyle={{ flexGrow: 1 }} stickyHeaderIndices={[0]}>
      <Nav go={go} scrollTo={scrollTo} />
      <Hero go={go} scrollTo={scrollTo} />
      <Words />
      <Manifesto />
      <Features onLayout={(y) => (ys.current.ozellikler = y)} />
      <How />
      <Pricing go={go} onLayout={(y) => (ys.current.fiyat = y)} />
      <Contact onLayout={(y) => (ys.current.iletisim = y)} />
      <Footer />
    </ScrollView>
    <View pointerEvents="box-none" style={{ position: 'absolute', right: 18, bottom: 18 }}>
      <Button kind="dark" title={t('Ücretsiz başla')} onPress={() => go('/kayit')} style={{ minHeight: 48, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } }} />
    </View>
    </View>
  );
}
