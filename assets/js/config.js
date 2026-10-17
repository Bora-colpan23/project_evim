/* Sunucu yapılandırması.

   Boş bırakılırsa uygulama DEMO modunda çalışır: veriler yalnızca bu
   tarayıcıda durur, hesap gerekmez, kiracı/mülk sahibi görünümleri arasında
   geçilebilir.

   Supabase projesi kurulunca (bkz. docs/kurulum.md) aşağıyı doldurun:
   - supabaseUrl, supabaseAnonKey: Supabase → Project Settings → API.
     "anon" anahtarı herkese açık olacak şekilde tasarlanmıştır; güvenlik
     veritabanındaki satır düzeyi kurallarla sağlanır. service_role
     anahtarını ASLA buraya yazmayın.
   - vapidPublicKey: anlık bildirimler için (npx web-push generate-vapid-keys).
   - billing: mülk sahibi aboneliği (bkz. docs/abonelik.md). RevenueCat'in
     herkese açık uygulama anahtarları (appl_…, goog_…) buraya yazılabilir;
     gizli anahtar (sk_…) yalnızca sunucu fonksiyonunda durur.

   Yapılandırılmış bir sitede adrese ?demo eklenirse yine demo açılır. */

export const CONFIG = Object.assign({
  supabaseUrl: '',
  supabaseAnonKey: '',
  vapidPublicKey: '',
  // Uygulamanın yayın adresi. Davet ve e-posta bağlantıları bu adresle üretilir;
  // telefonda uygulamayı doğrudan açar (docs/mobil.md).
  publicUrl: 'https://evim.online/',
  billing: {
    revenuecatIosKey: '',       // RevenueCat → Apps → App Store uygulaması → Public API key (appl_…)
    revenuecatAndroidKey: '',   // RevenueCat → Apps → Play Store uygulaması → Public API key (goog_…)
    // Web'den kartla satış: boşken web'deki abonelik sayfası telefondan abone olmayı anlatır.
    webPurchaseUrl: '',         // RevenueCat Web Purchase Link (https://pay.rev.cat/…); kullanıcı kimliği sona eklenir
    webManageUrl: '',           // web aboneleri için abonelik yönetimi sayfası
    termsUrl: '',               // kullanım koşulları (mağazalar zorunlu tutar)
    privacyUrl: '',             // gizlilik politikası
    appStoreUrl: '',            // yayından sonra: https://apps.apple.com/tr/app/…
    playStoreUrl: '',           // yayından sonra: https://play.google.com/store/apps/details?id=online.evim.app
    androidPackage: 'online.evim.app', // Play Store abonelik yönetimi bağlantısı için
    // Mağazadaki paketler. Fiyat mobilde mağazadan okunur; web'de burada yazan gösterilir
    // (App Store Connect ve Play Console'daki fiyatla aynı tutulmalı).
    plans: [
      { id:'monthly', package:'$rc_monthly', price:'₺249,99' },
      { id:'annual',  package:'$rc_annual',  price:'₺2.499,99' }
    ]
  },
  // supabase-js modülünün adresi (testler sahte bir sürümle değiştirir).
  supabaseJs: 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
}, globalThis.EVIM_CONFIG || {});

const forceDemo = new URLSearchParams(location.search).has('demo');

/** Gerçek hesaplarla mı çalışıyoruz? */
export const LIVE = !!(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey) && !forceDemo;
