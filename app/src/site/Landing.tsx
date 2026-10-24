import { useRef } from 'react';
import { Linking, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { t } from '../domain/i18n';
import { CONFIG } from '../domain/config';
import { Button, Chip, Container, PressScale, Text } from '../ui/kit';
import { fonts, radius, useBreakpoint, useColors } from '../ui/theme';
import { features, more, planPoints, plans } from './content';

const enter = (i: number) => FadeInDown.delay(80 + i * 70).springify().damping(22).stiffness(120);

function Logo({ onDark }: { onDark?: boolean }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 12, height: 12, borderWidth: 2.5, borderColor: c.accentInk, borderRadius: 3 }} />
      </View>
      <Text v="h3" color={onDark ? c.heroInk : c.ink}>Kiracım</Text>
    </View>
  );
}

function Nav({ go, scrollTo }: { go: (p: string) => void; scrollTo: (k: string) => void }) {
  const c = useColors();
  const { phone } = useBreakpoint();
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: c.line, backgroundColor: c.bg }}>
      <Container style={{ minHeight: 68, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo />
        {!phone && (
          <View style={{ flexDirection: 'row', gap: 28 }}>
            {[['ozellikler', t('Özellikler')], ['fiyat', t('Fiyatlar')], ['iletisim', t('İletişim')]].map(([k, l]) => (
              <PressScale key={k} onPress={() => scrollTo(k)} accessibilityRole="link" style={{ paddingVertical: 10 }}>
                <Text v="small" style={{ fontFamily: fonts.bodyBold }}>{l}</Text>
              </PressScale>
            ))}
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Button kind="quiet" title={t('Giriş yap')} onPress={() => go('/giris')} />
          <Button kind="dark" title={t('Kayıt ol')} onPress={() => go('/kayit')} />
        </View>
      </Container>
    </View>
  );
}

/** Uygulamanın gerçek bir ekranının küçük canlı örneği (görsel değil, bileşen). */
function Preview() {
  const c = useColors();
  return (
    <View style={{ width: '100%', maxWidth: 380, alignSelf: 'center', backgroundColor: c.surface, borderRadius: 36, borderWidth: 1, borderColor: c.line, padding: 18, gap: 14, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 40, shadowOffset: { width: 0, height: 24 } }}>
      <View style={{ backgroundColor: c.hero, borderRadius: 24, padding: 20, gap: 6 }}>
        <Text v="label" color={c.heroMuted}>{t('Kasım kirası')}</Text>
        <Text v="num" color={c.heroInk}>₺28.500</Text>
        <Text v="small" color={c.heroMuted}>{t('5 Kasım · 12 gün kaldı')}</Text>
        <View style={{ marginTop: 10 }}><Button title={t('Dekont yükle')} kind="primary" onPress={() => {}} /></View>
      </View>
      <View style={{ backgroundColor: c.bg, borderRadius: 20, padding: 16, gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text v="h3">{t('Sözleşme yenileme')}</Text><Chip tone="warn" label={t('52 gün')} />
        </View>
        <Text v="small" muted>{t('Artış, 12 aylık TÜFE ortalamasıyla sınırlı. İki taraf aynı hesabı görür.')}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 6 }}>
        <Text v="small" style={{ fontFamily: fonts.bodyBold }}>{t('Kombi basıncı düşüyor')}</Text>
        <Chip tone="accent" label={t('İşlemde')} />
      </View>
    </View>
  );
}

function Hero({ go, scrollTo }: { go: (p: string) => void; scrollTo: (k: string) => void }) {
  const { desktop, phone } = useBreakpoint();
  const c = useColors();
  return (
    <Container style={{ paddingTop: phone ? 36 : 88, paddingBottom: phone ? 48 : 104 }}>
      <View style={{ flexDirection: desktop ? 'row' : 'column', gap: desktop ? 72 : 44, alignItems: desktop ? 'center' : 'stretch' }}>
        <View style={{ flex: desktop ? 1.15 : undefined, gap: 24 }}>
          <Animated.View entering={enter(0)}><Chip tone="accent" label={t('Kiracılar için ücretsiz')} /></Animated.View>
          <Animated.View entering={enter(1)}>
            <Text v="display" style={phone ? { fontSize: 38, lineHeight: 42, letterSpacing: -1.4 } : undefined}>
              {t('Kira takibi, iki taraf için tek yerde.')}
            </Text>
          </Animated.View>
          <Animated.View entering={enter(2)} style={{ maxWidth: 560 }}>
            <Text v="body" muted style={{ fontSize: 18, lineHeight: 28 }}>
              {t('Kiracı ve mülk sahibi aynı kayda iki taraftan bakar: ödemeler, talepler, belgeler, tutanak, depozito, giderler ve sözleşme yenileme tek akışta.')}
            </Text>
          </Animated.View>
          <Animated.View entering={enter(3)} style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button title={t('Ücretsiz başla')} onPress={() => go('/kayit')} />
            <Button kind="ghost" title={t('Fiyatları gör')} onPress={() => scrollTo('fiyat')} />
          </Animated.View>
          <Animated.View entering={enter(4)}>
            <Text v="small" color={c.muted}>{t('Mülk sahipleri 14 gün kartsız dener. Konut, ofis, mağaza ve depo.')}</Text>
          </Animated.View>
        </View>
        <Animated.View entering={enter(3)} style={{ flex: desktop ? 0.85 : undefined }}><Preview /></Animated.View>
      </View>
    </Container>
  );
}

function Features({ onLayout }: { onLayout: (y: number) => void }) {
  const c = useColors();
  const { desktop, phone } = useBreakpoint();
  const big = features();
  return (
    <View onLayout={(e) => onLayout(e.nativeEvent.layout.y)} style={{ backgroundColor: c.surface, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.line }}>
      <Container style={{ paddingVertical: phone ? 56 : 104, gap: 48 }}>
        <View style={{ maxWidth: 640, gap: 12 }}>
          <Text v="label" color={c.accent}>{t('Özellikler')}</Text>
          <Text v="h1" style={phone ? { fontSize: 30, lineHeight: 34 } : undefined}>{t('Kiranın tüm işi, ödemeden çıkışa.')}</Text>
        </View>
        {/* Asimetrik ızgara: sol sütunda iki uzun kart, sağda iki kısa kart. */}
        <View style={{ flexDirection: desktop ? 'row' : 'column', gap: 16 }}>
          <View style={{ flex: 1.2, gap: 16 }}>
            {[big[0], big[2]].map((f) => <FeatureCard key={f.id} title={f.title} body={f.body} tall />)}
          </View>
          <View style={{ flex: 1, gap: 16 }}>
            {[big[1], big[3]].map((f) => <FeatureCard key={f.id} title={f.title} body={f.body} />)}
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -12, rowGap: 28 }}>
          {more().map((m) => (
            <View key={m.title} style={{ width: phone ? '100%' : desktop ? '25%' : '50%', paddingHorizontal: 12, gap: 6, borderTopWidth: 1, borderTopColor: c.line, paddingTop: 16 }}>
              <Text v="h3">{m.title}</Text>
              <Text v="small" muted>{m.body}</Text>
            </View>
          ))}
        </View>
      </Container>
    </View>
  );
}

function FeatureCard({ title, body, tall }: { title: string; body: string; tall?: boolean }) {
  const c = useColors();
  return (
    <View style={{ backgroundColor: c.bg, borderRadius: radius.xl, padding: 28, gap: 10, minHeight: tall ? 220 : 180, justifyContent: 'flex-end', borderWidth: 1, borderColor: c.line }}>
      <Text v="h2">{title}</Text>
      <Text v="body" muted style={{ maxWidth: 520 }}>{body}</Text>
    </View>
  );
}

function Pricing({ go, onLayout }: { go: (p: string) => void; onLayout: (y: number) => void }) {
  const c = useColors();
  const { desktop, phone } = useBreakpoint();
  return (
    <View onLayout={(e) => onLayout(e.nativeEvent.layout.y)}>
      <Container style={{ paddingVertical: phone ? 56 : 104, gap: 40 }}>
        <View style={{ maxWidth: 640, gap: 12 }}>
          <Text v="label" color={c.accent}>{t('Fiyatlar')}</Text>
          <Text v="h1" style={phone ? { fontSize: 30, lineHeight: 34 } : undefined}>{t('Kiracı ücretsiz. Mülk sahibi aylık ya da yıllık.')}</Text>
          <Text v="body" muted>{t('Mülk sahibi hesapları 14 gün kartsız denenir. Süre bitince kayıtlar salt okunur olur; kiracının işleri hiç etkilenmez.')}</Text>
        </View>
        <View style={{ flexDirection: desktop ? 'row' : 'column', gap: 16, alignItems: 'stretch' }}>
          <View style={{ flex: 0.8, backgroundColor: c.surface, borderRadius: radius.xl, padding: 28, gap: 12, borderWidth: 1, borderColor: c.line }}>
            <Text v="h3">{t('Kiracı')}</Text>
            <Text v="num">{t('Ücretsiz')}</Text>
            <Text v="small" muted>{t('Dekont yükle, talep aç, mesaj yaz, belgelerine bak. Her zaman.')}</Text>
            <View style={{ flex: 1 }} />
            <Button kind="ghost" block title={t('Kiracı olarak kayıt ol')} onPress={() => go('/kayit')} />
          </View>
          {plans().map((p) => (
            <View key={p.id} style={{ flex: 1, backgroundColor: p.best ? c.hero : c.surface, borderRadius: radius.xl, padding: 28, gap: 14, borderWidth: 1, borderColor: p.best ? c.hero : c.line }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text v="h3" color={p.best ? c.heroInk : c.ink}>{t('Mülk sahibi')} · {p.name}</Text>
                {p.best && <Chip tone="accent" label={p.note} />}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text v="num" color={p.best ? c.heroInk : c.ink}>{p.price}</Text>
                <Text v="small" color={p.best ? c.heroMuted : c.muted}>{p.per}</Text>
              </View>
              {!p.best && <Text v="small" muted>{p.note}</Text>}
              <View style={{ gap: 8, marginVertical: 6 }}>
                {planPoints().map((x) => (
                  <View key={x} style={{ flexDirection: 'row', gap: 10 }}>
                    <Text v="small" color={c.accent} style={{ fontFamily: fonts.bodyXBold }}>+</Text>
                    <Text v="small" color={p.best ? c.heroMuted : c.muted} style={{ flex: 1 }}>{x}</Text>
                  </View>
                ))}
              </View>
              <View style={{ flex: 1 }} />
              <Button kind={p.best ? 'primary' : 'dark'} block title={t('14 gün ücretsiz dene')} onPress={() => go('/kayit')} />
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
    <View onLayout={(e) => onLayout(e.nativeEvent.layout.y)} style={{ backgroundColor: c.hero }}>
      <Container style={{ paddingVertical: phone ? 56 : 96, flexDirection: desktop ? 'row' : 'column', gap: 40, justifyContent: 'space-between' }}>
        <View style={{ gap: 14, maxWidth: 560 }}>
          <Text v="label" color={c.accent}>{t('İletişim')}</Text>
          <Text v="h1" color={c.heroInk} style={phone ? { fontSize: 30, lineHeight: 34 } : undefined}>{t('Soruların için yaz.')}</Text>
          <Text v="body" color={c.heroMuted}>{t('Hesap, abonelik ve veri silme işlemleri için destek sayfasına ya da e-postaya ulaşabilirsin.')}</Text>
        </View>
        <View style={{ gap: 14, alignItems: desktop ? 'flex-end' : 'flex-start' }}>
          <Text v="h2" color={c.heroInk} selectable>{CONFIG.supportEmail}</Text>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <Button title={t('E-posta gönder')} onPress={mail} />
            <Button kind="ghost" style={{ borderColor: '#4a463f' }} title={t('Destek sayfası')} onPress={() => Linking.openURL(CONFIG.legal.support)} />
          </View>
        </View>
      </Container>
    </View>
  );
}

function Footer() {
  const c = useColors();
  const items: [string, string][] = [[t('Kullanım Koşulları'), CONFIG.legal.terms], [t('Gizlilik ve KVKK'), CONFIG.legal.privacy], [t('Hesap silme'), CONFIG.legal.deletion]];
  return (
    <View style={{ backgroundColor: c.hero, borderTopWidth: 1, borderTopColor: '#34302a' }}>
      <Container style={{ paddingVertical: 28, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
        <Logo onDark />
        <View style={{ flexDirection: 'row', gap: 22, flexWrap: 'wrap' }}>
          {items.map(([l, u]) => (
            <PressScale key={u} accessibilityRole="link" onPress={() => Linking.openURL(u)} style={{ paddingVertical: 8 }}>
              <Text v="small" color={c.heroMuted}>{l}</Text>
            </PressScale>
          ))}
        </View>
      </Container>
    </View>
  );
}

export default function Landing() {
  const router = useRouter();
  const ref = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const ys = useRef<Record<string, number>>({});
  const go = (p: string) => router.push(p as any);
  const scrollTo = (k: string) => ref.current?.scrollTo({ y: Math.max(0, (ys.current[k] ?? 0) - 4), animated: true });
  return (
    <ScrollView ref={ref} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} stickyHeaderIndices={[0]}>
      <Nav go={go} scrollTo={scrollTo} />
      <Hero go={go} scrollTo={scrollTo} />
      <Features onLayout={(y) => (ys.current.ozellikler = y)} />
      <Pricing go={go} onLayout={(y) => (ys.current.fiyat = y)} />
      <Contact onLayout={(y) => (ys.current.iletisim = y)} />
      <Footer />
    </ScrollView>
  );
}
