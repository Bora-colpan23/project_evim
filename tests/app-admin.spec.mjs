// Yönetici denetimi, uygulama (app/) üzerinde uçtan uca: kiracı dekont yükler, mülk sahibi
// yönetici onaylayana kadar görmez, yönetici panelinde onaylar ya da gerekçeyle reddeder.
// Sunucu tarafı kuralları gerçek Postgres'te ayrıca sınanır (admin.sql.spec.mjs); burada
// istemci akışı sahte Supabase (app/src/testing/fake-supabase.js) ile doğrulanır.
import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { serveDist, seed, PW } from './app-helpers.mjs';
import { watchErrors, PNG } from './helpers.mjs';

// Sahte sunucuyla derlenmiş çıktı; uygulama kodu değişince `rm -rf app/dist-fake` ile yeniden üretilir.
const DIST = new URL('../app/dist-fake', import.meta.url).pathname;
const PORT = 8201;
let server;
let errors;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  test.setTimeout(300_000);                       // ilk çalıştırmada uygulama derlenir
  if (!existsSync(DIST + '/index.html')) {
    execSync('npx expo export -p web --output-dir dist-fake', {
      cwd: new URL('../app', import.meta.url).pathname, stdio: 'inherit',
      env: { ...process.env, EXPO_PUBLIC_SUPABASE_URL: 'fake:', EXPO_PUBLIC_SUPABASE_ANON_KEY: 'fake' }
    });
  }
  server = await serveDist(DIST, PORT);
});
test.afterAll(() => server && server.close());

test.beforeEach(async ({ page }) => {
  errors = watchErrors(page);
  await page.addInitScript(db => { if (!localStorage.getItem('__fakedb')) localStorage.setItem('__fakedb', JSON.stringify(db)); }, seed());
});
test.afterEach(() => { expect(errors).toEqual([]); });

const url = p => `http://localhost:${PORT}${p}`;
const db = page => page.evaluate(() => JSON.parse(localStorage.getItem('__fakedb')));

/** Oturumu kapatıp (sahte sunucu oturumu) verilen hesapla giriş yapar. */
const ENTRY = { 'kiraci@ornek.com': '/giris/kiraci', 'ev@ornek.com': '/giris/mulk-sahibi', 'admin@ornek.com': '/giris/yonetici' };
async function login(page, email, path = ENTRY[email]) {
  await page.goto(url(path));
  await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('__fakedb')); d.session = null; localStorage.setItem('__fakedb', JSON.stringify(d)); });
  await page.goto(url(path));
  await page.getByLabel('E-posta').fill(email);
  await page.getByLabel('Şifre', { exact: true }).fill(PW);
  await page.getByRole('button', { name: 'Giriş yap' }).click();
}

async function uploadReceipt(page) {
  await page.getByRole('button', { name: 'Dekont yükle' }).first().click();
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Dosya seç' }).click();
  await (await chooser).setFiles(PNG);
  await expect(page.getByText('dekont.png')).toBeVisible();
  await page.getByRole('button', { name: 'Gönder' }).click();
}

/** Kiracı olarak giriş yapıp bir dekont yükler; denetim kaydı sunucuya düşene kadar bekler. */
async function tenantUploads(page) {
  await login(page, 'kiraci@ornek.com');
  await expect(page.getByText('Moda Dairesi').first()).toBeVisible();
  await uploadReceipt(page);
  await expect(page.getByText('Kiracım ekibi dekontu inceliyor').first()).toBeVisible();
  await expect.poll(async () => (await db(page)).tables.reviews.length).toBe(1);   // eşitleme gecikmeli çalışır
}

test('kiracı dekont yükler; denetim kaydı düşer, mülk sahibi onaydan önce görmez', async ({ page }) => {
  await login(page, 'kiraci@ornek.com');
  await expect(page.getByText('Moda Dairesi').first()).toBeVisible();
  await uploadReceipt(page);
  await expect(page.getByText('Kiracım ekibi dekontu inceliyor').first()).toBeVisible();

  await expect.poll(async () => (await db(page)).tables.reviews.length).toBe(1);   // eşitleme gecikmeli çalışır
  const d = await db(page);
  expect(d.tables.reviews[0]).toMatchObject({ kind: 'payment', status: 'pending', property_id: 'p1' });
  expect(d.tables.reviews[0].path).toMatch(/^p1\/.+\.jpg$/);              // dosya depoya yüklendi
  expect(d.tables.payments).toHaveLength(1);
  expect(Object.keys(d.storage)).toHaveLength(1);

  await login(page, 'ev@ornek.com');
  await expect(page.getByText('Moda Dairesi').first()).toBeVisible();
  await expect(page.getByText('Onay bekliyor')).toHaveCount(0);           // mülk sahibi henüz görmez
  expect((await db(page)).tables.notifications).toHaveLength(0);
});

test('yönetici dekontu onaylar; mülk sahibi onay bekleyen ödemeyi görür ve bildirim alır', async ({ page }) => {
  await tenantUploads(page);
  await login(page, 'admin@ornek.com');
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByText('Yönetici', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Denetim \(1\)/ })).toBeVisible();
  await expect(page.getByText('dekont.png').first()).toBeVisible();
  await page.getByRole('button', { name: 'Onayla', exact: true }).click();
  await expect(page.getByText('Bekleyen yükleme yok')).toBeVisible();

  const d = await db(page);
  expect(d.tables.reviews[0].status).toBe('approved');
  expect(d.tables.notifications.map(n => n.title)).toEqual(['Dekont geldi']);

  await login(page, 'ev@ornek.com');
  await expect(page.getByText('Onay bekliyor').first()).toBeVisible();
});

test('yönetici panelinde ödemeler ve mülk sahibi → kiracı ağacı görünür', async ({ page }) => {
  await tenantUploads(page);
  await login(page, 'admin@ornek.com');
  await page.getByRole('button', { name: 'Ödemeler' }).click();
  await expect(page.getByText('Mehmet Kiracı → Ayşe Mülk')).toBeVisible();
  await expect(page.getByText('₺30.000').first()).toBeVisible();
  await page.getByRole('button', { name: 'Mülk sahipleri' }).click();
  await page.getByText('Ayşe Mülk').first().click();
  await expect(page.getByText('Moda Dairesi').first()).toBeVisible();
  await expect(page.getByText('• Mehmet Kiracı')).toBeVisible();
  await page.getByRole('button', { name: 'Kullanıcılar' }).click();
  await expect(page.getByText('kiraci@ornek.com')).toBeVisible();
});

test('yönetici reddeder: gerekçe zorunlu, kiracı gerekçeyi görür, ödeme reddedilir', async ({ page }) => {
  await tenantUploads(page);

  await login(page, 'admin@ornek.com');
  await page.getByRole('button', { name: 'Reddet', exact: true }).click();
  await page.getByRole('button', { name: 'Reddet', exact: true }).last().click();       // gerekçesiz
  await expect(page.getByText('Red için gerekçe yaz.')).toBeVisible();
  await page.getByLabel('Red gerekçesi').fill('Dekont okunmuyor');
  await page.getByRole('button', { name: 'Reddet', exact: true }).last().click();
  await expect(page.getByText('Bekleyen yükleme yok')).toBeVisible();

  const d = await db(page);
  expect(d.tables.reviews[0]).toMatchObject({ status: 'rejected', note: 'Dekont okunmuyor' });
  expect(d.tables.payments[0]).toMatchObject({ status: 'rejected', reject_reason: 'Denetim: Dekont okunmuyor' });

  await login(page, 'kiraci@ornek.com');
  await expect(page.getByText('Denetim: Dekont okunmuyor').first()).toBeVisible();
});

test('yönetici olmayan /admin adresine giremez', async ({ page }) => {
  await login(page, 'kiraci@ornek.com');
  await page.goto(url('/admin'));
  await expect(page).toHaveURL(/\/uygulama/);
});

test('davet bağlantısı kodu saklar; mülke bağlı olmayan kiracı kod ekranını görür', async ({ page }) => {
  await page.goto(url('/giris'));
  await page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem('__fakedb'));
    d.tables.memberships = d.tables.memberships.filter(m => m.role !== 'tenant');
    d.tables.invites.push({ code: 'ABCD1234', property_id: 'p1', name: 'Mehmet', email: '', phone: '', created_by: d.users[0].id, accepted_by: null });
    localStorage.setItem('__fakedb', JSON.stringify(d));
  });
  await login(page, 'kiraci@ornek.com');
  await expect(page.getByText('Mülkine bağlan').first()).toBeVisible();
  await page.getByLabel('Davet kodu').fill('abcd1234');
  await page.getByRole('button', { name: 'Mülke bağlan' }).click();
  await expect(page.getByText('Moda Dairesi').first()).toBeVisible();
});

test('/katil?kod=… bağlantısı: kod saklanır, giriş sonrası kiracı mülke otomatik bağlanır', async ({ page }) => {
  await page.goto(url('/giris'));
  await page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem('__fakedb'));
    d.tables.memberships = d.tables.memberships.filter(m => m.role !== 'tenant');
    d.tables.invites.push({ code: 'ABCD1234', property_id: 'p1', name: 'Mehmet', email: '', phone: '', created_by: d.users[0].id, accepted_by: null });
    localStorage.setItem('__fakedb', JSON.stringify(d));
  });
  await page.goto(url('/katil?kod=abcd1234'));
  await expect(page.getByText('ABCD1234')).toBeVisible();
  await page.getByRole('button', { name: 'Hesabım var, giriş yap' }).click();
  await page.getByLabel('E-posta').fill('kiraci@ornek.com');
  await page.getByLabel('Şifre', { exact: true }).fill(PW);
  await page.getByRole('button', { name: 'Giriş yap' }).click();
  await expect(page.getByText('Moda Dairesi').first()).toBeVisible();
  expect((await db(page)).tables.invites[0].accepted_by).toBeTruthy();
});

test('giriş ayrı: hesap türü girişle uyuşmazsa oturum açılmaz', async ({ page }) => {
  await page.goto(url('/giris'));
  await expect(page.getByRole('link', { name: /Kiracı girişi/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Mülk sahibi girişi/ })).toBeVisible();

  await login(page, 'ev@ornek.com', '/giris/kiraci');
  await expect(page.getByText('Bu hesap bir mülk sahibi hesabı. Mülk sahibi girişini kullan.')).toBeVisible();
  await login(page, 'kiraci@ornek.com', '/giris/mulk-sahibi');
  await expect(page.getByText('Bu hesap bir kiracı hesabı. Kiracı girişini kullan.')).toBeVisible();
  await login(page, 'kiraci@ornek.com', '/giris/yonetici');
  await expect(page.getByText('Bu hesap yönetici hesabı değil.')).toBeVisible();
  await login(page, 'admin@ornek.com', '/giris/kiraci');
  await expect(page.getByText('Bu bir yönetici hesabı. Yönetici girişini kullan.')).toBeVisible();
  await expect(page).toHaveURL(/\/giris\/kiraci$/);

  await login(page, 'ev@ornek.com', '/giris/mulk-sahibi');
  await expect(page).toHaveURL(/\/uygulama$/);
  await expect(page.getByText('Moda Dairesi').first()).toBeVisible();
});

test('kayıt ayrı: mülk sahibi kaydı rol seçtirmeden mülk sahibi hesabı açar', async ({ page }) => {
  await page.goto(url('/kayit'));
  await page.getByRole('link', { name: /Mülk sahibi olarak kayıt ol/ }).click();
  await expect(page).toHaveURL(/\/kayit\/mulk-sahibi$/);
  await page.getByLabel('Ad soyad').fill('Yeni Mülk Sahibi');
  await page.getByLabel('E-posta').fill('yeni@ornek.com');
  await page.getByLabel('Şifre', { exact: true }).fill(PW);
  await page.getByRole('checkbox').click();
  await page.getByRole('button', { name: 'Hesap oluştur' }).click();
  await expect(page).toHaveURL(/\/uygulama$/);
  const d = await db(page);
  expect(d.tables.profiles.find(p => p.name === 'Yeni Mülk Sahibi').role).toBe('landlord');
});
