/* Telefon maketi: tanıtım sayfasındaki ürün görselleri. Fotoğraf yerine uygulamanın gerçek parçaları
   (kira kartı, pencere şeridi, talep adımları, yazışma) bir telefon çerçevesinin içinde çizilir.
   Tüm ölçüler genişliğe (w) oranlıdır; w=230 tasarım ölçüsüdür. */
import { ReactNode } from 'react';
import { Text as RNText, View } from 'react-native';
import { t } from '../domain/i18n';
import { fonts, radius, useColors } from '../ui/theme';
import { MonthStrip, Kind } from '../ui/Facade';
import { Icon } from '../app-ui/blocks';

const BEZEL = '#0B0F25';

/** Çerçeve: koyu kasa, çentik, yumuşak gölge. Yükseklik genişliğin 2,05 katıdır. */
export function PhoneFrame({ w = 230, children, dark, tilt = 0 }: { w?: number; children: ReactNode; dark?: boolean; tilt?: number }) {
  const c = useColors();
  const bez = w * 0.032;
  return (
    <View aria-hidden importantForAccessibility="no-hide-descendants" style={{ width: w, height: w * 2.05, borderRadius: w * 0.17, backgroundColor: BEZEL, padding: bez, boxShadow: '0 30px 60px -20px rgba(18,26,59,0.45), 0 0 0 1px rgba(255,255,255,0.14) inset', transform: [{ rotate: tilt + 'deg' }] }}>
      <View style={{ flex: 1, borderRadius: w * 0.14, overflow: 'hidden', backgroundColor: dark ? c.deepA : '#FFFCF7' }}>
        <View pointerEvents="none" style={{ position: 'absolute', top: w * 0.028, alignSelf: 'center', width: w * 0.3, height: w * 0.058, borderRadius: w * 0.03, backgroundColor: BEZEL, zIndex: 5 }} />
        {children}
      </View>
    </View>
  );
}

function Status({ u, dark }: { u: number; dark?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18 * u, paddingTop: 12 * u }}>
      <RNText style={{ fontFamily: fonts.bodyBold, fontSize: 9 * u, color: dark ? '#FBF4EA' : '#121A3B' }}>9:41</RNText>
      <View style={{ width: 16 * u, height: 8 * u, borderRadius: 3 * u, backgroundColor: dark ? '#FBF4EA' : '#121A3B', opacity: 0.85 }} />
    </View>
  );
}

function Row({ u, a, b, tone, dark }: { u: number; a: string; b: string; tone?: 'ok' | 'warn'; dark?: boolean }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: dark ? 'rgba(251,244,234,0.08)' : '#FBF4EA', borderRadius: 12 * u, paddingHorizontal: 12 * u, minHeight: 34 * u }}>
      <RNText style={{ fontFamily: fonts.bodyBold, fontSize: 11 * u, color: dark ? '#FBF4EA' : '#121A3B' }}>{a}</RNText>
      <RNText style={{ fontFamily: fonts.bodyBold, fontSize: 10.5 * u, color: tone === 'ok' ? (dark ? '#BFE8D2' : '#17653F') : tone === 'warn' ? (dark ? '#FFE98F' : '#5E4A00') : dark ? '#FBF4EA' : '#121A3B' }}>{b}</RNText>
    </View>
  );
}

/** Dört adımlı ilerleme çubuğu; yazılar telefon ölçeğiyle küçülür. */
function MiniSteps({ u, status, labels }: { u: number; status: number; labels: string[] }) {
  return (
    <View style={{ gap: 6 * u }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', flex: i < 3 ? 1 : 0 }}>
            <View style={{ width: 10 * u, height: 10 * u, borderRadius: 5 * u, backgroundColor: i <= status ? '#FF5A2E' : '#E6DFD3' }} />
            {i < 3 && <View style={{ flex: 1, height: 2.5 * u, backgroundColor: i < status ? '#FF5A2E' : '#E6DFD3' }} />}
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {labels.map((l, i) => <RNText key={l} style={{ fontFamily: i === status ? fonts.bodyBold : fonts.body, fontSize: 8 * u, color: i === status ? '#121A3B' : '#4A4F63' }}>{l}</RNText>)}
      </View>
    </View>
  );
}

const lit = (n: number): Kind[] => Array.from({ length: 12 }, (_, i) => (i < n ? 'lit' : 'off'));

/** Ödemeler: kira tutarı, 12 pencere ve geçmiş aylar. */
export function ScreenPayments({ w = 230 }: { w?: number }) {
  const u = w / 230;
  return (
    <View style={{ flex: 1 }}>
      <Status u={u} />
      <View style={{ padding: 16 * u, paddingTop: 14 * u, gap: 10 * u }}>
        <RNText style={{ fontFamily: fonts.body, fontSize: 10.5 * u, color: '#4A4F63' }}>{t('Merhaba Ayşe')}</RNText>
        <RNText style={{ fontFamily: fonts.display, fontSize: 21 * u, color: '#121A3B', letterSpacing: -0.4 * u }}>{t('Kasım kirası')}</RNText>
        <View style={{ backgroundColor: '#121A3B', borderRadius: 18 * u, padding: 14 * u, gap: 8 * u }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <RNText style={{ fontFamily: fonts.body, fontSize: 10 * u, color: '#B8BCD6' }}>{t('Moda, Kadıköy')}</RNText>
            <View style={{ backgroundColor: '#FFD84A', borderRadius: 99, paddingHorizontal: 8 * u, paddingVertical: 2 * u }}><RNText style={{ fontFamily: fonts.bodyBold, fontSize: 9 * u, color: '#121A3B' }}>{t('3 gün kaldı')}</RNText></View>
          </View>
          <RNText style={{ fontFamily: fonts.displayBold, fontSize: 28 * u, color: '#FBF4EA', letterSpacing: -0.8 * u }}>₺28.500</RNText>
          <MonthStrip kinds={lit(7)} onDark />
        </View>
        <RNText style={{ fontFamily: fonts.bodyBold, fontSize: 9.5 * u, color: '#4A4F63', letterSpacing: 0.3 }}>{t('Son işlemler')}</RNText>
        <Row u={u} a={t('Ekim kirası')} b={t('Ödendi')} tone="ok" />
        <Row u={u} a={t('Eylül kirası')} b={t('Ödendi')} tone="ok" />
        <Row u={u} a={t('Musluk arızası')} b={t('Bekliyor')} tone="warn" />
      </View>
    </View>
  );
}

/** Kira kartı (koyu ekran): bu ayın kirası ve dekont yükleme düğmesi. */
export function ScreenRent({ w = 230 }: { w?: number }) {
  const c = useColors();
  const u = w / 230;
  return (
    <View style={{ flex: 1, backgroundColor: c.deepA }}>
      <Status u={u} dark />
      <View style={{ padding: 18 * u, paddingTop: 22 * u, gap: 12 * u }}>
        <RNText style={{ fontFamily: fonts.body, fontSize: 11 * u, color: '#B8BCD6' }}>{t('Bu ayın kirası')}</RNText>
        <RNText style={{ fontFamily: fonts.displayBold, fontSize: 40 * u, color: '#FBF4EA', letterSpacing: -1.2 * u }}>₺28.500</RNText>
        <MonthStrip kinds={lit(7)} onDark />
        <RNText style={{ fontFamily: fonts.body, fontSize: 10.5 * u, color: '#B8BCD6' }}>{t('12 pencerenin 7’si yandı')}</RNText>
        <View style={{ height: 40 * u, borderRadius: 99, backgroundColor: '#FF5A2E', alignItems: 'center', justifyContent: 'center', marginTop: 4 * u }}>
          <RNText style={{ fontFamily: fonts.bodyBold, fontSize: 12 * u, color: '#121A3B' }}>{t('Dekont yükle')}</RNText>
        </View>
        <View style={{ gap: 6 * u, marginTop: 8 * u }}>
          <Row u={u} a={t('Ekim')} b={t('Ödendi')} tone="ok" dark />
          <Row u={u} a={t('Eylül')} b={t('Ödendi')} tone="ok" dark />
          <Row u={u} a={t('Ağustos')} b={t('Ödendi')} tone="ok" dark />
        </View>
      </View>
    </View>
  );
}

function Bubble({ u, text, mine }: { u: number; text: string; mine?: boolean }) {
  return (
    <View style={{ alignSelf: mine ? 'flex-end' : 'flex-start', backgroundColor: mine ? '#121A3B' : '#FBF4EA', borderRadius: 14 * u, paddingHorizontal: 11 * u, paddingVertical: 7 * u, maxWidth: '88%' }}>
      <RNText style={{ fontFamily: fonts.body, fontSize: 10.5 * u, color: mine ? '#FBF4EA' : '#121A3B' }}>{text}</RNText>
    </View>
  );
}

/** Talepler: dört adım ve fotoğraflı yazışma. */
export function ScreenRequests({ w = 230 }: { w?: number }) {
  const u = w / 230;
  return (
    <View style={{ flex: 1 }}>
      <Status u={u} />
      <View style={{ padding: 16 * u, paddingTop: 14 * u, gap: 10 * u }}>
        <RNText style={{ fontFamily: fonts.display, fontSize: 21 * u, color: '#121A3B', letterSpacing: -0.4 * u }}>{t('Talepler')}</RNText>
        <View style={{ backgroundColor: '#FBF4EA', borderRadius: 16 * u, padding: 12 * u, gap: 10 * u }}>
          <RNText style={{ fontFamily: fonts.bodyBold, fontSize: 11.5 * u, color: '#121A3B' }}>{t('Kombi basıncı düşüyor')}</RNText>
          <MiniSteps u={u} status={2} labels={[t('Açıldı'), t('Görüldü'), t('İşlemde'), t('Çözüldü')]} />
        </View>
        <Row u={u} a={t('Usta teklifi')} b="₺1.850" />
        <Row u={u} a={t('Fatura')} b={t('Gidere işlendi')} tone="ok" />
        <View style={{ gap: 7 * u, marginTop: 4 * u }}>
          <View style={{ alignSelf: 'flex-start', width: 120 * u, height: 70 * u, borderRadius: 14 * u, backgroundColor: '#D8D0FF', alignItems: 'center', justifyContent: 'center' }}><Icon name="cam" size={Math.round(24 * u)} color="#121A3B" /></View>
          <Bubble u={u} text={t('Kombi basıncı düşüyor')} />
          <Bubble u={u} mine text={t('Gördüm, yarın servis arayacak.')} />
        </View>
      </View>
    </View>
  );
}

/** Depozito ve çıkış: kesinti ve iade hesabı. */
export function ScreenDeposit({ w = 230 }: { w?: number }) {
  const u = w / 230;
  return (
    <View style={{ flex: 1 }}>
      <Status u={u} />
      <View style={{ padding: 16 * u, paddingTop: 14 * u, gap: 10 * u }}>
        <RNText style={{ fontFamily: fonts.display, fontSize: 21 * u, color: '#121A3B', letterSpacing: -0.4 * u }}>{t('Çıkış')}</RNText>
        <View style={{ backgroundColor: '#BFE8D2', borderRadius: 18 * u, padding: 14 * u, gap: 4 * u }}>
          <RNText style={{ fontFamily: fonts.body, fontSize: 10.5 * u, color: '#121A3B' }}>{t('İade edilecek')}</RNText>
          <RNText style={{ fontFamily: fonts.displayBold, fontSize: 30 * u, color: '#121A3B', letterSpacing: -0.8 * u }}>₺60.800</RNText>
        </View>
        <Row u={u} a={t('Depozito')} b="₺65.000" />
        <Row u={u} a={t('Kesintiler')} b="− ₺4.200" tone="warn" />
        <Row u={u} a={t('Giriş tutanağı')} b={t('Karşılaştırıldı')} tone="ok" />
        <View style={{ height: 40 * u, borderRadius: 99, backgroundColor: '#FF5A2E', alignItems: 'center', justifyContent: 'center' }}>
          <RNText style={{ fontFamily: fonts.bodyBold, fontSize: 12 * u, color: '#121A3B' }}>{t('İki taraf da onayla')}</RNText>
        </View>
      </View>
    </View>
  );
}
