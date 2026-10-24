import { t } from '../domain/i18n';
import { CONFIG } from '../domain/config';

/** Tanıtım metinleri: yalnızca uygulamada bulunan özellikler (README → "Ne yapabiliyor"). */
export const features = () => [
  { id: 'odeme', title: t('Ödemeler'), body: t('Dekont tutar, tarih ve notla yüklenir. Eksik tutar kısmi ödeme olur, kalan bakiye takip edilir. Mülk sahibi onaylar ya da gerekçeyle reddeder; gecikme iki tarafta aynı görünür.') },
  { id: 'talep', title: t('Talepler, teklif ve fatura'), body: t('Arıza, tadilat ve ek talep dört adımda ilerler: Açıldı, Görüldü, İşlemde, Çözüldü. Usta teklifleri karşılaştırılır; fatura otomatik olarak gider defterine işlenir.') },
  { id: 'cikis', title: t('Çıkış ve depozito iadesi'), body: t('Çıkış tutanağı giriş tutanağıyla oda oda karşılaştırılır. Mülk sahibi kesinti girer, iki taraf onaylar, iade hesaplanır.') },
  { id: 'yenileme', title: t('Sözleşme yenileme'), body: t('TÜFE ortalamasıyla yasal üst sınır hesaplanır. Teklif sınırı aşamaz; kiracı kabul eder ya da görüşmeye çağırır.') }
];
export const more = () => [
  { title: t('Kira geçmişi'), body: t('Her tutar değişikliği geçerlilik tarihiyle saklanır; geçmiş dönemler o dönemin kirasıyla hesaplanır.') },
  { title: t('Gider defteri ve net getiri'), body: t('Emlak vergisi, aidat, sigorta, tamir. Ev başına yıllık net getiri ve değere göre getiri oranı.') },
  { title: t('Vergi tahmini'), body: t('Konut kira geliri istisnası, götürü ve gerçek gider yöntemlerinin karşılaştırması.') },
  { title: t('Konut, ofis, mağaza, depo'), body: t('Tutanak alanları, talep önerileri ve belge kategorileri mülk tipine göre gelir.') },
  { title: t('Şirket kiracı ve stopaj'), body: t('Kira stopajı (%20) düşülerek net tutar beklenir; brüt ve stopaj ayrı gösterilir.') },
  { title: t('Birden fazla kiracı'), body: t('Aynı eve birden çok kiracı hesabı davet bağlantısı ya da kodla eklenir.') },
  { title: t('Takip'), body: t('Ayarlanabilir hatırlatmalar, takvim, Türkçe karakter duyarsız arama, yıllık rapor ve CSV.') },
  { title: t('Verin sende'), body: t('JSON dışa ve içe aktarma. Silme gibi geri dönüşsüz işler onay ister.') }
];

export const plans = () => ([
  { id: 'monthly', name: t('Aylık'), price: CONFIG.billing.plans[0].label, per: t('/ ay'), note: t('İstediğin zaman iptal et') },
  { id: 'annual', name: t('Yıllık'), price: CONFIG.billing.plans[1].label, per: t('/ yıl'), note: t('2 ay bedava'), best: true }
]);

export const planPoints = () => [
  t('14 gün deneme, kart istenmez'),
  t('Sınırsız mülk ve kiracı hesabı'),
  t('Ödeme, talep, belge, gider ve rapor'),
  t('Deneme veya abonelik bitince kayıtlar salt okunur; okuma ve mesajlaşma açık kalır')
];
