/* Tanıtım sayfası. Yön (Midas düzeni, Apple sadeliği, Kiracım paleti): beyaz yapışkan üst menü, ortalı büyük başlık ve
   üç telefon, sayfa genişliğinde dar bir sütunda yığılmış büyük beyaz kartlar (metin + telefon), koyu degrade kart,
   koyu tam genişlik bölüm, güven kartları, akordeon SSS, koyu son çağrı ve koyu altbilgi.
   Renk: Krem Duvar zemin, beyaz kartlar, Kiremit vurgu (butonlarda Gece Mürekkebi metin), Gece Mürekkebi koyu alanlar. */
import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { t, getLang, setLang } from '../domain/i18n';
import { CONFIG } from '../domain/config';
import { Button, Container, PressScale, Text } from '../ui/kit';
import { Wordmark } from '../ui/Wordmark';
import { fonts, radius, shadows, useBreakpoint, useColors } from '../ui/theme';
import { useLangTick } from '../app-ui/hooks';
import { Icon } from '../app-ui/blocks';
import { planPoints, plans } from './content';
import { Nav, TopBar } from './Navbar';
import { Grain } from '../ui/Grain';
import { PhoneFrame, ScreenDeposit, ScreenPayments, ScreenRent, ScreenRequests } from './Phone';

const COLW = 880;          // yığılmış kartların sütun genişliği
const INK = '#121A3B';

/** Web'de CSS degrade, yerel uygulamada düz renk. */
const grad = (css: string, fallback: string): any => (Platform.OS === 'web' ? { backgroundColor: fallback, backgroundImage: css } : { backgroundColor: fallback });

/** Başlık: Inter Display. */
function D({ children, size, color, style, weight = 'bold' }: { children: any; size: number; color?: string; style?: any; weight?: 'bold' | 'semi' }) {
  const c = useColors();
  return <RNText style={[{ fontFamily: weight === 'semi' ? fonts.displayMid : fonts.siteBold, fontSize: size, lineHeight: Math.round(size * 1.12), letterSpacing: -size * 0.02, color: color ?? c.ink }, style]}>{children}</RNText>;
}

/** Metin içinde bir ifadeyi vurgulu (Kiremit, kalın) gösterir. */
function Rich({ text, mark, color, size = 16 }: { text: string; mark?: string; color?: string; size?: number }) {
  const c = useColors();
  const i = mark ? text.indexOf(mark) : -1;
  const base = { fontFamily: fonts.body, fontSize: size, lineHeight: Math.round(size * 1.6), color: color ?? c.muted };
  if (i < 0) return <RNText style={base}>{text}</RNText>;
  return (
    <RNText style={base}>
      {text.slice(0, i)}<RNText style={{ fontFamily: fonts.bodyBold, color: c.accentText }}>{mark}</RNText>{text.slice(i + (mark as string).length)}
    </RNText>
  );
}

function Section({ children, bg, id, onLayout, style }: { children: any; bg?: string; id?: string; onLayout?: (y: number) => void; style?: any }) {
  return <View nativeID={id} onLayout={onLayout ? (e) => onLayout(e.nativeEvent.layout.y) : undefined} style={[{ backgroundColor: bg }, style]}>{children}</View>;
}

/* ------------------------------------------------------------------ hero */

function Hero({ go, scrollTo }: { go: (p: string) => void; scrollTo: (k: string) => void }) {
  const c = useColors();
  const { phone, width } = useBreakpoint();
  const size = phone ? 38 : width >= 1100 ? 64 : 52;
  const pw = phone ? 210 : width >= 1100 ? 250 : 220;      // ortadaki telefonun genişliği
  const sw = Math.round(pw * 0.9);
  const stage = Math.round(pw * (phone ? 1.25 : 1.35));    // görünen yükseklik; telefonlar altta kesilir
  return (
    <Section bg={c.surface}>
      <Container style={{ alignItems: 'center', paddingTop: phone ? 40 : 72, gap: phone ? 18 : 22 }}>
        <Animated.View entering={FadeInDown.duration(500)} style={{ alignItems: 'center', gap: 6 }}>
          <RNText accessibilityRole="header" style={{ textAlign: 'center', maxWidth: 940, fontFamily: fonts.siteBold, fontSize: size, lineHeight: Math.round(size * 1.08), letterSpacing: -size * 0.025, color: c.ink }}>
            {t('Kira işi,')} {t('ev kadar')} <RNText style={{ color: c.accent }}>{t('rahat.')}</RNText>
          </RNText>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(120).duration(500)} style={{ alignItems: 'center', gap: 22, maxWidth: 640 }}>
          <Text v="body" style={{ fontSize: phone ? 16 : 18, lineHeight: phone ? 24 : 28, textAlign: 'center' }}>
            {t('Sözleşme, ödeme, depozito ve arıza yazışması tek uygulamada. Kiracı ve mülk sahibi aynı kayda iki taraftan bakar.')}
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button kind="primary" title={t('Ücretsiz başla')} onPress={() => go('/kayit')} />
            <Button kind="ghost" title={t('Fiyatları gör')} onPress={() => scrollTo('fiyat')} />
          </View>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(240).duration(600)} style={{ width: '100%', height: stage, overflow: 'hidden', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', marginTop: phone ? 10 : 20 }}>
          {!phone && <View style={{ marginTop: 44, marginRight: -sw * 0.1, zIndex: 1 }}><PhoneFrame w={sw} tilt={-3}><ScreenPayments w={sw} /></PhoneFrame></View>}
          <View style={{ zIndex: 2 }}><PhoneFrame w={pw} dark><ScreenRent w={pw} /></PhoneFrame></View>
          {!phone && <View style={{ marginTop: 44, marginLeft: -sw * 0.1, zIndex: 1 }}><PhoneFrame w={sw} tilt={3}><ScreenRequests w={sw} /></PhoneFrame></View>}
        </Animated.View>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------- yığılmış özellik kartları */

function FeatureCard({ title, body, mark, side, children }: { title: string; body: string; mark?: string; side: 'left' | 'right'; children: any }) {
  const c = useColors();
  const { phone } = useBreakpoint();
  const pw = 210;
  if (phone) {
    return (
      <View style={{ backgroundColor: c.surface, borderRadius: radius.lg, overflow: 'hidden' }}>
        <View style={{ padding: 24, gap: 12 }}>
          <D size={26} weight="semi">{title}</D>
          <Rich text={body} mark={mark} size={15} />
        </View>
        <View style={{ height: 250, overflow: 'hidden', alignItems: 'center' }}>{children}</View>
      </View>
    );
  }
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: radius.lg, overflow: 'hidden', minHeight: 330, flexDirection: 'row', justifyContent: side === 'right' ? 'flex-start' : 'flex-end' }}>
      <View style={{ width: '54%', padding: 44, justifyContent: 'center', gap: 14 }}>
        <D size={30} weight="semi">{title}</D>
        <Rich text={body} mark={mark} size={15} />
      </View>
      <View pointerEvents="none" style={{ position: 'absolute', top: 44, [side === 'right' ? 'right' : 'left']: 56, width: pw }}>{children}</View>
    </View>
  );
}

function Stack({ go, onLayout }: { go: (p: string) => void; onLayout: (y: number) => void }) {
  const c = useColors();
  const { phone } = useBreakpoint();
  const pw = phone ? 190 : 210;
  return (
    <Section id="ozellikler" bg={c.bg} onLayout={onLayout} style={{ paddingVertical: phone ? 28 : 72 }}>
      <Container style={{ maxWidth: COLW + 32, gap: phone ? 14 : 24 }}>
        <FeatureCard side="right" title={t('Dekontunu yükle, ödeme kayda geçsin')} mark={t('dekontunu yükle')}
          body={t('Tutar, tarih ve notla dekontunu yükle. Kiracım ekibi kontrol eder; onaylanınca mülk sahibi görür ve ödeme iki tarafta aynı durumu gösterir.')}>
          <PhoneFrame w={pw}><ScreenPayments w={pw} /></PhoneFrame>
        </FeatureCard>
        <FeatureCard side="left" title={t('Arızayı fotoğrafla anlat, adım adım izle')} mark={t('adım adım izle')}
          body={t('Arıza ve tadilat dört adımda ilerler: Açıldı, Görüldü, İşlemde, Çözüldü. Fotoğraf yazışmanın içinde görünür; usta teklifleri karşılaştırılır, fatura gidere işlenir.')}>
          <PhoneFrame w={pw}><ScreenRequests w={pw} /></PhoneFrame>
        </FeatureCard>
        <FeatureCard side="right" title={t('Depozito ve çıkış hesabı tek ekranda')} mark={t('iade hesaplanır')}
          body={t('Çıkış tutanağı giriş tutanağıyla oda oda karşılaştırılır. Mülk sahibi kesinti girer, iki taraf onaylar ve iade hesaplanır.')}>
          <PhoneFrame w={pw}><ScreenDeposit w={pw} /></PhoneFrame>
        </FeatureCard>
        <View style={{ borderRadius: radius.lg, overflow: 'hidden', flexDirection: phone ? 'column' : 'row', alignItems: 'center', gap: phone ? 20 : 48, padding: phone ? 28 : 48, minHeight: 300, ...grad('radial-gradient(90% 120% at 0% 100%, rgba(255,90,46,0.38), transparent 60%), linear-gradient(135deg, #0B0F25, #1B2250)', '#141B45') }}>
          <Grain />
          <View style={{ width: phone ? 150 : 190, height: phone ? 150 : 190, borderRadius: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(251,244,234,0.22)', ...grad('linear-gradient(145deg, rgba(251,244,234,0.16), rgba(251,244,234,0.03))', 'rgba(251,244,234,0.08)') }}>
            <Wordmark size={phone ? 17 : 22} variant="cream" />
          </View>
          <View style={{ flex: phone ? undefined : 1, gap: 12 }}>
            <RNText style={{ fontFamily: fonts.displayMid, fontSize: phone ? 26 : 30, lineHeight: phone ? 31 : 36, letterSpacing: -0.6, color: 'rgba(251,244,234,0.55)' }}>
              {t('Portföyünü')} <RNText style={{ color: '#FBF4EA' }}>{t('profesyonelce yönet')}</RNText>
            </RNText>
            <RNText style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 24, color: '#D8DBEA' }}>
              {t('Tüm mülkler ve kiracılar tek ekranda. Gider defteri, ev başına net getiri ve vergi tahmini; kira geçmişi ve TÜFE sınırıyla yenileme hesabı.')}
            </RNText>
            <View style={{ flexDirection: 'row' }}>
              <Pressable accessibilityRole="button" onPress={() => go('/kayit/mulk-sahibi')} style={{ minHeight: 44, borderRadius: 99, paddingHorizontal: 22, backgroundColor: '#FBF4EA', alignItems: 'center', justifyContent: 'center' }}>
                <RNText style={{ fontFamily: fonts.bodyBold, fontSize: 15, color: INK }}>{t('Mülk sahibi olarak dene')}</RNText>
              </Pressable>
            </View>
          </View>
        </View>
      </Container>
    </Section>
  );
}

/* ------------------------------------------- koyu tam genişlik bölüm (cam objeler) */

function Diamonds({ s }: { s: number }) {
  const icons = ['key', 'card', 'doc', 'chat', 'calendar'];
  return (
    <View style={{ width: s * (0.62 * 4 + 1.45), height: s * 1.5, justifyContent: 'center' }}>
      {icons.map((ic, i) => (
        <View key={ic} style={{ position: 'absolute', left: i * s * 0.62, top: s * 0.2, width: s, height: s, alignItems: 'center', justifyContent: 'center', zIndex: i }}>
          <View style={{ position: 'absolute', width: s * 0.82, height: s * 0.82, borderRadius: s * 0.2, transform: [{ rotate: '45deg' }], borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', boxShadow: '0 18px 30px -10px rgba(255,90,46,0.45), inset 0 1px 0 rgba(255,255,255,0.7)', ...grad('linear-gradient(150deg, #FFFFFF 0%, #B9BDCC 40%, #6C7288 70%, #2A2F4A 100%)', '#9AA0B5') }} />
          <View style={{ position: 'absolute', left: (i < 4 ? s * 0.25 : s * 0.5) - s * 0.15 }}><Icon name={ic} size={Math.round(s * 0.3)} color={INK} /></View>
        </View>
      ))}
    </View>
  );
}

function Windows({ go, scrollTo }: { go: (p: string) => void; scrollTo: (k: string) => void }) {
  const c = useColors();
  const { phone, width } = useBreakpoint();
  const wide = width >= 900;
  return (
    <Section bg={c.deepA} style={{ overflow: 'hidden' }}>
      <Grain opacity={0.07} />
      <Container style={{ maxWidth: 1000, paddingVertical: phone ? 56 : 96, flexDirection: wide ? 'row' : 'column', alignItems: 'center', gap: phone ? 32 : 56 }}>
        <View style={{ alignItems: 'center' }}><Diamonds s={phone ? 92 : wide ? 128 : 112} /></View>
        <View style={{ flex: wide ? 1 : undefined, gap: 16, alignItems: wide ? 'flex-start' : 'center' }}>
          <D size={phone ? 28 : 34} color="#FBF4EA" weight="semi" style={{ textAlign: wide ? 'left' : 'center' }}>{t('Ödediğin gün bir pencere yanar.')}</D>
          <RNText style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 24, color: '#C9CDE0', textAlign: wide ? 'left' : 'center', maxWidth: 420 }}>
            {t('Her ay bir pencere: 12 ay, 12 pencere. Kira ödenince o ayın penceresi yanar; kimin neyi ne zaman ödediği tek bakışta görünür.')}
          </RNText>
          <Pressable accessibilityRole="button" onPress={() => scrollTo('nasil')} style={{ minHeight: 44, borderRadius: 99, paddingHorizontal: 24, backgroundColor: '#FBF4EA', alignItems: 'center', justifyContent: 'center' }}>
            <RNText style={{ fontFamily: fonts.bodyBold, fontSize: 15, color: INK }}>{t('Nasıl çalışır')}</RNText>
          </Pressable>
        </View>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------------ güven */

function Trust() {
  const c = useColors();
  const { phone, width } = useBreakpoint();
  const items: [string, string, string][] = [
    ['check', t('Onaylı yüklemeler'), t('Dekont, belge ve faturalar Kiracım ekibince kontrol edilir; onaylanana kadar karşı tarafa görünmez.')],
    ['key', t('Sana özel erişim'), t('Herkes yalnızca bağlı olduğu mülkün kaydını görür. Kurallar veritabanı katmanında uygulanır.')],
    ['doc', t('Kayıtlı işlemler'), t('Yöneticinin yaptığı her hassas işlem, yazışma incelemeleri dahil, değiştirilemez bir kayda yazılır.')],
    ['safe', t('Verin sende'), t('Verini JSON olarak dışa aktarabilir, hesabını uygulama içinden silebilirsin.')]
  ];
  return (
    <Section bg={c.surface} style={{ paddingVertical: phone ? 48 : 88 }}>
      <Container style={{ maxWidth: 1000, alignItems: 'center', gap: 14 }}>
        <D size={phone ? 28 : 34} weight="semi" style={{ textAlign: 'center' }}>{t('Bilgilerin güvende')}</D>
        <RNText style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 24, color: c.muted, textAlign: 'center', maxWidth: 620 }}>
          {t('Kira kaydı kişisel bilgidir. Bu yüzden kimin neyi gördüğü baştan belli ve denetimlidir.')}
        </RNText>
        <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: phone ? 10 : 24 }}>
          {items.map(([ic, title, body]) => (
            <View key={title} style={{ flexGrow: 1, flexBasis: width >= 900 ? 200 : 260, backgroundColor: c.bg, borderRadius: radius.lg, padding: 22, gap: 12, minHeight: 210 }}>
              <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}><Icon name={ic} size={19} color={INK} /></View>
              <RNText style={{ fontFamily: fonts.displayMid, fontSize: 17, color: c.ink }}>{title}</RNText>
              <RNText style={{ fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: c.muted }}>{body}</RNText>
            </View>
          ))}
        </View>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------------- nasıl çalışır */

/** Çerçeve (outline) adım numarası: web'de içi boş, çizgili; yerel uygulamada soluk dolgu. */
function Outline({ n }: { n: string }) {
  const c = useColors();
  const rgb = c.ink === '#121A3B' ? '18,26,59' : '251,244,234';
  const web: any = Platform.OS === 'web' ? { color: 'transparent', WebkitTextStroke: `1.5px rgba(${rgb},0.42)` } : { color: `rgba(${rgb},0.18)` };
  return <Text accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[{ fontFamily: fonts.display, fontSize: 80, lineHeight: 78, letterSpacing: -2 }, web]}>{n}</Text>;
}

function How({ onLayout }: { onLayout: (y: number) => void }) {
  const c = useColors();
  const { phone, width } = useBreakpoint();
  const steps: [string, string, string, string][] = [
    ['01', t('Hesap aç'), t('Kiracı hesabı ücretsizdir. Mülk sahibi hesabı 14 gün kartsız denenir.'), t('Kiracıysan ev sahibinden gelen davet bağlantısıyla kayıt ol.')],
    ['02', t('Mülkü ekle, kiracıyı davet et'), t('Mülk sahibi mülkü ekler ve davet bağlantısı ya da kodu kiracıya gönderir. Kiracı kayıt olunca mülke bağlanır.'), t('Davet kodunu mesajla da gönderebilirsin.')],
    ['03', t('Birlikte takip edin'), t('Dekont, talep, belge ve tutanak tek kayıtta durur. Aynı kaydı iki taraf da kendi ekranında görür.'), t('Sorun olursa yazışmaya fotoğraf ekle, görsel anlatsın.')]
  ];
  const lists: [string, string[]][] = [
    [t('Kiracı için'), [t('Kira ve ödeme durumunu görür, dekont yükler'), t('Arıza ve tadilat talebi açar, durumunu izler'), t('Mesajlaşır, belgelerine ve giriş tutanağına bakar'), t('Sözleşme yenileme teklifini kabul eder ya da görüşmeye çağırır')]],
    [t('Mülk sahibi için'), [t('Tüm mülklerini ve kiracılarını tek ekranda görür'), t('Dekontu onaylar, talepleri ilerletir, teklifleri karşılaştırır'), t('Gider defteri, net getiri ve vergi tahminine bakar'), t('Çıkışta kesintileri girer, depozito iadesini hesaplar')]]
  ];
  const col = width >= 900;
  return (
    <Section id="nasil" bg={c.bg} onLayout={onLayout} style={{ paddingVertical: phone ? 48 : 88 }}>
      <Container style={{ maxWidth: COLW + 120, gap: phone ? 20 : 32 }}>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <D size={phone ? 28 : 34} weight="semi" style={{ textAlign: 'center' }}>{t('Üç adımda başla.')}</D>
        </View>
        <View style={{ flexDirection: col ? 'row' : 'column', gap: 14 }}>
          {steps.map(([n, title, body, tip]) => (
            <View key={n} style={{ flex: 1, backgroundColor: c.surface, borderRadius: radius.lg, padding: 26, gap: 12, minHeight: 250, overflow: 'hidden' }}>
              <Outline n={n} />
              <RNText style={{ fontFamily: fonts.displayMid, fontSize: 20, lineHeight: 25, letterSpacing: -0.3, color: c.ink }}>{title}</RNText>
              <RNText style={{ fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: c.muted }}>{body}</RNText>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 'auto' as any }}>
                <View style={{ backgroundColor: INK, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Text v="label" color="#FBF4EA" style={{ fontFamily: fonts.bodyBold }}>{t('İpucu')}</Text>
                </View>
                <Text v="small" style={{ flex: 1, fontFamily: fonts.bodyMedium }}>{tip}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: col ? 'row' : 'column', gap: 14 }}>
          {lists.map(([title, items]) => (
            <View key={title} style={{ flex: 1, backgroundColor: c.surface, borderRadius: radius.lg, padding: 26, gap: 14 }}>
              <RNText style={{ fontFamily: fonts.displayMid, fontSize: 20, color: c.ink }}>{title}</RNText>
              <View style={{ gap: 10 }}>
                {items.map((x) => (
                  <View key={x} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.accent, marginTop: 8 }} />
                    <RNText style={{ flex: 1, fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: c.muted }}>{x}</RNText>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
        <Text v="small" muted style={{ textAlign: 'center', maxWidth: 680, alignSelf: 'center' }}>{t('Yüklenen dekont, belge ve faturalar Kiracım ekibince kontrol edilir; onaylanınca karşı tarafa görünür. Reddedilirse yükleyen gerekçesiyle birlikte haber alır.')}</Text>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------------------- fiyat */

function Pricing({ go, onLayout }: { go: (p: string) => void; onLayout: (y: number) => void }) {
  const c = useColors();
  const { width, phone } = useBreakpoint();
  const row = width >= 900;
  return (
    <Section id="fiyat" bg={c.surface} onLayout={onLayout} style={{ paddingVertical: phone ? 48 : 88 }}>
      <Container style={{ maxWidth: 1000, gap: phone ? 20 : 32 }}>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <D size={phone ? 28 : 34} weight="semi" style={{ textAlign: 'center' }}>{t('Kiracı ücretsiz. Mülk sahibi aylık ya da yıllık.')}</D>
          <RNText style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 24, color: c.muted, textAlign: 'center', maxWidth: 620 }}>{t('Mülk sahibi hesapları 14 gün kartsız denenir. Süre bitince kayıtlar salt okunur olur; kiracının işleri hiç etkilenmez.')}</RNText>
        </View>
        <View style={{ flexDirection: row ? 'row' : 'column', gap: 14, alignItems: 'stretch' }}>
          <View style={{ flex: 0.8, backgroundColor: c.bg, borderRadius: radius.lg, padding: 28, gap: 12 }}>
            <RNText style={{ fontFamily: fonts.displayMid, fontSize: 20, color: c.ink }}>{t('Kiracı')}</RNText>
            <D size={44}>{t('Ücretsiz')}</D>
            <Text v="small" muted>{t('Dekont yükle, talep aç, mesaj yaz, belgelerine bak. Her zaman.')}</Text>
            <View style={{ flex: 1, minHeight: 20 }} />
            <Button kind="ghost" block title={t('Kiracı olarak kayıt ol')} onPress={() => go('/kayit/kiraci')} />
          </View>
          {plans().map((p) => (
            <View key={p.id} style={[{ flex: 1, borderRadius: radius.lg, padding: 28, gap: 12, overflow: 'hidden' }, p.best ? grad('radial-gradient(90% 90% at 100% 0%, rgba(255,90,46,0.3), transparent 60%), linear-gradient(135deg, #0B0F25, #1B2250)', '#141B45') : { backgroundColor: c.bg }]}>
              {p.best && <Grain />}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <RNText style={{ fontFamily: fonts.displayMid, fontSize: 20, color: p.best ? '#FBF4EA' : c.ink }}>{t('Mülk sahibi')} · {p.name}</RNText>
                {p.best && <View style={{ backgroundColor: '#FFD84A', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 }}><RNText style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: INK }}>{p.note}</RNText></View>}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <D size={44} color={p.best ? '#FBF4EA' : c.ink}>{p.price}</D>
                <Text v="small" color={p.best ? '#C9CDE0' : c.muted}>{p.per}</Text>
              </View>
              {!p.best && <Text v="small" muted>{p.note}</Text>}
              <View style={{ gap: 10, marginVertical: 6 }}>
                {planPoints().map((x) => (
                  <View key={x} style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: p.best ? '#FF8A68' : c.accent, marginTop: 7 }} />
                    <Text v="small" color={p.best ? '#C9CDE0' : c.muted} style={{ flex: 1 }}>{x}</Text>
                  </View>
                ))}
              </View>
              <View style={{ flex: 1, minHeight: 10 }} />
              <Button kind="primary" block title={t('14 gün ücretsiz dene')} onPress={() => go('/kayit/mulk-sahibi')} />
            </View>
          ))}
        </View>
      </Container>
    </Section>
  );
}

/* ----------------------------------------------------------------------- SSS */

function Faq({ onLayout }: { onLayout: (y: number) => void }) {
  const c = useColors();
  const { phone } = useBreakpoint();
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
    <Section id="sss" bg={c.bg} onLayout={onLayout} style={{ paddingVertical: phone ? 48 : 88 }}>
      <Container style={{ maxWidth: COLW + 32, gap: phone ? 20 : 32 }}>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <D size={phone ? 28 : 34} weight="semi" style={{ textAlign: 'center' }}>{t('Sıkça sorulan sorular')}</D>
          <Text v="small" style={{ fontFamily: fonts.bodyBold, textAlign: 'center' }} muted>{t('Aklına takılanları cevaplamak için buradayız.')}</Text>
        </View>
        <View>
          {qa.map(([q, a], i) => {
            const on = open === i;
            return (
              <View key={q} style={{ borderTopWidth: 1, borderTopColor: c.line, ...(i === qa.length - 1 ? { borderBottomWidth: 1, borderBottomColor: c.line } : null) }}>
                <Pressable accessibilityRole="button" aria-expanded={on} accessibilityState={{ expanded: on }} onPress={() => setOpen(on ? -1 : i)}
                  style={{ minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingVertical: 14 }}>
                  <RNText style={{ flex: 1, fontFamily: fonts.bodyMedium, fontSize: phone ? 15 : 16, color: c.ink }}>{q}</RNText>
                  <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: c.accentText, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ position: 'absolute', width: 10, height: 1.5, backgroundColor: c.accentText }} />
                    {!on && <View style={{ position: 'absolute', width: 1.5, height: 10, backgroundColor: c.accentText }} />}
                  </View>
                </Pressable>
                {on && (
                  <Animated.View entering={FadeIn.duration(200)} style={{ paddingBottom: 22, paddingRight: 40 }}>
                    <RNText style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 24, color: c.muted }}>{a}</RNText>
                  </Animated.View>
                )}
              </View>
            );
          })}
        </View>
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL(CONFIG.legal.support)} style={{ alignSelf: 'center', minHeight: 44, justifyContent: 'center' }}>
          <RNText style={{ fontFamily: fonts.bodyBold, fontSize: 14, color: c.accentText, textDecorationLine: 'underline' }}>{t('Daha fazla bilgi için destek sayfamıza ulaşabilirsin.')}</RNText>
        </Pressable>
      </Container>
    </Section>
  );
}

/* ---------------------------------------------------------------- son çağrı */

function Cta({ go }: { go: (p: string) => void }) {
  const { phone } = useBreakpoint();
  return (
    <Section style={{ ...grad('radial-gradient(70% 90% at 50% 0%, rgba(255,138,104,0.55), rgba(75,60,140,0.25) 45%, transparent 75%), linear-gradient(180deg, #1B2250 0%, #0B0F25 70%)', '#0B0F25'), overflow: 'hidden' }}>
      <Grain opacity={0.08} />
      <Container style={{ alignItems: 'center', paddingVertical: phone ? 56 : 96, gap: 18 }}>
        <RNText style={{ fontFamily: fonts.body, fontSize: 14, color: '#E7E9F4', textAlign: 'center' }}>{t('Kira işini düzene sokmak için')}</RNText>
        <D size={phone ? 32 : 46} color="#FBF4EA" style={{ textAlign: 'center' }}>{t('Hesabını ücretsiz aç')}</D>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 8 }}>
          <Pressable accessibilityRole="button" onPress={() => go('/kayit/kiraci')} style={{ minHeight: 52, borderRadius: 99, paddingHorizontal: 26, backgroundColor: '#FBF4EA', flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
            <Icon name="key" size={20} color={INK} />
            <View><RNText style={{ fontFamily: fonts.body, fontSize: 11, color: '#4A4F63' }}>{t('Ücretsiz')}</RNText><RNText style={{ fontFamily: fonts.bodyBold, fontSize: 15, color: INK }}>{t('Kiracı olarak kayıt ol')}</RNText></View>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => go('/kayit/mulk-sahibi')} style={{ minHeight: 52, borderRadius: 99, paddingHorizontal: 26, backgroundColor: '#FBF4EA', flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
            <Icon name="landlord" size={20} color={INK} />
            <View><RNText style={{ fontFamily: fonts.body, fontSize: 11, color: '#4A4F63' }}>{t('14 gün kartsız')}</RNText><RNText style={{ fontFamily: fonts.bodyBold, fontSize: 15, color: INK }}>{t('Mülk sahibi olarak dene')}</RNText></View>
          </Pressable>
        </View>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------------ altbilgi */

function Footer({ go, scrollTo, onLayout }: { go: (p: string) => void; scrollTo: (k: string) => void; onLayout: (y: number) => void }) {
  const { phone, width } = useBreakpoint();
  const lang = getLang();
  const wide = width >= 900;
  const mail = () => Linking.openURL('mailto:' + CONFIG.supportEmail).catch(() => {});
  const L = ({ onPress, children }: { onPress: () => void; children: string }) => (
    <PressScale onPress={onPress} accessibilityRole="link" style={{ minHeight: 40, justifyContent: 'center' }}>
      <RNText style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: '#E7E9F4' }}>{children}</RNText>
    </PressScale>
  );
  const legal: [string, string][] = [[t('Kullanım Koşulları'), CONFIG.legal.terms], [t('Gizlilik ve KVKK'), CONFIG.legal.privacy], [t('Hesap silme'), CONFIG.legal.deletion]];
  return (
    <Section id="iletisim" bg="#0B0F25" onLayout={onLayout}>
      <Container style={{ maxWidth: 1000, paddingTop: phone ? 40 : 64, gap: phone ? 28 : 40 }}>
        <View style={{ flexDirection: wide ? 'row' : 'column', gap: wide ? 0 : 28 }}>
          <View style={{ flex: 1.1, gap: 16, paddingRight: 24 }}>
            <Wordmark size={30} variant="cream" />
            <RNText style={{ fontFamily: fonts.body, fontSize: 13, lineHeight: 20, color: '#9AA0BC', maxWidth: 260 }}>{t('Kira işi, ev kadar rahat.')}</RNText>
          </View>
          <View style={{ flex: 1.2, flexDirection: 'row', gap: 32 }}>
            <View style={{ flex: 1 }}>
              <L onPress={() => scrollTo('ozellikler')}>{t('Özellikler')}</L>
              <L onPress={() => scrollTo('nasil')}>{t('Nasıl çalışır')}</L>
              <L onPress={() => scrollTo('fiyat')}>{t('Fiyatlar')}</L>
              <L onPress={() => scrollTo('sss')}>{t('SSS')}</L>
            </View>
            <View style={{ flex: 1 }}>
              <L onPress={() => go('/giris')}>{t('Giriş yap')}</L>
              <L onPress={() => go('/kayit/kiraci')}>{t('Kiracı olarak kayıt ol')}</L>
              <L onPress={() => go('/kayit/mulk-sahibi')}>{t('Mülk sahibi olarak dene')}</L>
            </View>
          </View>
          <View style={{ flex: 1.2, gap: 6, borderLeftWidth: wide ? 1 : 0, borderLeftColor: 'rgba(255,255,255,0.12)', paddingLeft: wide ? 32 : 0 }}>
            <RNText style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: '#9AA0BC' }}>{t('Destek')}</RNText>
            <PressScale onPress={mail} accessibilityRole="link" style={{ minHeight: 40, justifyContent: 'center' }}>
              <RNText style={{ fontFamily: fonts.displayBold, fontSize: 20, color: '#FBF4EA' }}>{CONFIG.supportEmail}</RNText>
            </PressScale>
            <PressScale onPress={() => Linking.openURL(CONFIG.legal.support)} accessibilityRole="link" style={{ minHeight: 40, justifyContent: 'center' }}>
              <RNText style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: '#E7E9F4', textDecorationLine: 'underline' }}>{t('Destek sayfası')}</RNText>
            </PressScale>
          </View>
        </View>
        <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)', paddingVertical: 18, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <RNText style={{ fontFamily: fonts.body, fontSize: 12, color: '#9AA0BC' }}>© {new Date().getFullYear()} Kiracım</RNText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18, alignItems: 'center' }}>
            {[['tr', 'Türkçe'], ['en', 'English']].map(([code, name]) => (
              <PressScale key={code} accessibilityRole="button" accessibilityState={{ selected: lang === code }} onPress={() => { setLang(code); if (typeof location !== 'undefined') location.reload(); }} style={{ minHeight: 44, minWidth: 48, justifyContent: 'center' }}>
                <RNText style={{ fontFamily: lang === code ? fonts.bodyBold : fonts.body, fontSize: 12, color: lang === code ? '#FBF4EA' : '#9AA0BC' }}>{name}</RNText>
              </PressScale>
            ))}
            {legal.map(([l, u]) => (
              <PressScale key={u} accessibilityRole="link" onPress={() => Linking.openURL(u)} style={{ minHeight: 44, justifyContent: 'center' }}>
                <RNText style={{ fontFamily: fonts.body, fontSize: 12, color: '#9AA0BC' }}>{l}</RNText>
              </PressScale>
            ))}
          </View>
        </View>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------------------- sayfa */

export default function Landing() {
  useLangTick();
  const c = useColors();
  const router = useRouter();
  const ref = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const ys = useRef<Record<string, number>>({});
  const [top, setTop] = useState(false);
  const go = (p: string) => router.push(p as any);
  const scrollTo = (k: string) => ref.current?.scrollTo({ y: Math.max(0, (ys.current[k] ?? 0) - 72), animated: true });
  return (
    <View style={{ flex: 1 }}>
      <ScrollView ref={ref} style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ flexGrow: 1 }} stickyHeaderIndices={[1]} scrollEventThrottle={120}
        onScroll={(e) => { const v = e.nativeEvent.contentOffset.y > 600; if (v !== top) setTop(v); }}>
        <TopBar />
        <Nav go={go} scrollTo={scrollTo} />
        <Hero go={go} scrollTo={scrollTo} />
        <Stack go={go} onLayout={(y) => (ys.current.ozellikler = y)} />
        <Windows go={go} scrollTo={scrollTo} />
        <Trust />
        <How onLayout={(y) => (ys.current.nasil = y)} />
        <Pricing go={go} onLayout={(y) => (ys.current.fiyat = y)} />
        <Faq onLayout={(y) => (ys.current.sss = y)} />
        <Cta go={go} />
        <Footer go={go} scrollTo={scrollTo} onLayout={(y) => (ys.current.iletisim = y)} />
      </ScrollView>
      {top && (
        <Animated.View entering={FadeIn.duration(180)} pointerEvents="box-none" style={{ position: 'absolute', right: 20, bottom: 20 }}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('Yukarı çık')} onPress={() => ref.current?.scrollTo({ y: 0, animated: true })}
            style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#FF5A2E', alignItems: 'center', justifyContent: 'center', boxShadow: shadows.lift }}>
            <View style={{ transform: [{ rotate: '90deg' }] }}><Icon name="back" size={20} color={INK} /></View>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}
