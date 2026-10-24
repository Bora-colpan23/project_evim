/* Oturum. Supabase kuruluysa gerçek hesap; değilse bu cihaza özel yerel hesap.
   Uygulama (/uygulama) yalnızca oturumla açılır. */
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as Crypto from 'expo-crypto';
import { hydrate, storage } from '../domain/storage';
import { LIVE, CONFIG } from '../domain/config';
import { closeLocal, openLocal, ui } from '../domain/state';
import { t } from '../domain/i18n';
import { account } from '../domain/billing';

export type Role = 'tenant' | 'landlord';
export type User = { id: string; email: string; name: string; role: Role; createdAt?: number };

const ACCOUNTS = 'kiracim-hesaplar';
const SESSION = 'kiracim-oturum';

type Account = User & { hash: string; salt: string; createdAt?: number };

const readAccounts = (): Account[] => { try { return JSON.parse(storage.getItem(ACCOUNTS) || '[]'); } catch { return []; } };
const hashPw = (pw: string, salt: string) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, salt + ':' + pw);

let sb: any = null;
async function supabase() {
  if (sb) return sb;
  const [{ createClient }, AsyncStorage] = await Promise.all([
    import('@supabase/supabase-js'),
    import('@react-native-async-storage/async-storage').then((m) => m.default)
  ]);
  sb = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
    auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false }
  });
  return sb;
}

type Ctx = {
  user: User | null; ready: boolean; live: boolean;
  signIn(e: string, p: string): Promise<string | null>;
  signUp(a: { name: string; email: string; password: string; role: Role }): Promise<string | null>;
  reset(email: string): Promise<string | null>;
  signOut(): Promise<void>;
};
const AuthCtx = createContext<Ctx>(null as unknown as Ctx);
export const useAuth = () => useContext(AuthCtx);

/** Veri bu sürümde cihazdadır (hesap başına ayrı anahtar); sunucu eşitlemesi sonraki aşamadır. */
function enter(u: User) {
  ui.role = u.role;
  account.since = u.createdAt || Date.now();
  openLocal('kiracim-veri-' + u.id, u.role);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await hydrate();
        if (LIVE) {
          const c = await supabase();
          const { data } = await c.auth.getSession();
          const s = data.session;
          if (s) {
            const m = s.user.user_metadata || {};
            const u = { id: s.user.id, email: s.user.email || '', name: m.name || '', role: (m.role as Role) || 'tenant' };
            enter(u); setUser(u);
          }
        } else {
          const id = storage.getItem(SESSION);
          const a = id && readAccounts().find((x) => x.id === id);
          if (a) { const u = { id: a.id, email: a.email, name: a.name, role: a.role, createdAt: a.createdAt }; enter(u); setUser(u); }
        }
      } catch {}
      setReady(true);
    })();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    email = email.trim().toLowerCase();
    if (!email || !password) return t('E-posta ve şifreni gir.');
    try {
      if (LIVE) {
        const c = await supabase();
        const { data, error } = await c.auth.signInWithPassword({ email, password });
        if (error) return t('E-posta ya da şifre yanlış.');
        const m = data.user.user_metadata || {};
        const u = { id: data.user.id, email, name: m.name || '', role: (m.role as Role) || 'tenant' };
        enter(u); setUser(u); return null;
      }
      const a = readAccounts().find((x) => x.email === email);
      if (!a || a.hash !== (await hashPw(password, a.salt))) return t('E-posta ya da şifre yanlış.');
      storage.setItem(SESSION, a.id);
      const u = { id: a.id, email: a.email, name: a.name, role: a.role, createdAt: a.createdAt };
      enter(u); setUser(u); return null;
    } catch { return t('Bağlantı kurulamadı. Biraz sonra yeniden dene.'); }
  }, []);

  const signUp = useCallback(async ({ name, email, password, role }: { name: string; email: string; password: string; role: Role }) => {
    email = email.trim().toLowerCase(); name = name.trim();
    if (!name || !email || password.length < 8) return t('Adını, e-postanı ve en az 8 karakterli bir şifre gir.');
    try {
      if (LIVE) {
        const c = await supabase();
        const { data, error } = await c.auth.signUp({ email, password, options: { data: { name, role, lang: 'tr' } } });
        if (error) return t('Hesap oluşturulamadı: {m}', { m: error.message });
        if (!data.session) return 'CONFIRM';
        const u = { id: data.user!.id, email, name, role };
        enter(u); setUser(u); return null;
      }
      const list = readAccounts();
      if (list.some((x) => x.email === email)) return t('Bu e-posta ile bir hesap zaten var.');
      const salt = Crypto.randomUUID();
      const id = Crypto.randomUUID().slice(0, 12);
      const createdAt = Date.now();
      list.push({ id, email, name, role, salt, createdAt, hash: await hashPw(password, salt) });
      storage.setItem(ACCOUNTS, JSON.stringify(list));
      storage.setItem(SESSION, id);
      const u = { id, email, name, role, createdAt };
      enter(u); setUser(u); return null;
    } catch { return t('Bağlantı kurulamadı. Biraz sonra yeniden dene.'); }
  }, []);

  const reset = useCallback(async (email: string) => {
    email = email.trim().toLowerCase();
    if (!email) return t('E-posta adresini yaz.');
    if (!LIVE) return t('Yerel hesap modunda şifre sıfırlanamaz. Sunucu kurulunca e-posta ile sıfırlanır.');
    try {
      const c = await supabase();
      const { error } = await c.auth.resetPasswordForEmail(email, { redirectTo: CONFIG.publicUrl });
      return error ? t('Bağlantı gönderilemedi.') : null;
    } catch { return t('Bağlantı kurulamadı. Biraz sonra yeniden dene.'); }
  }, []);

  const signOut = useCallback(async () => {
    try { if (LIVE) await (await supabase()).auth.signOut(); } catch {}
    storage.removeItem(SESSION);
    closeLocal(); ui.role = 'tenant'; setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, live: LIVE, signIn, signUp, reset, signOut }), [user, ready, signIn, signUp, reset, signOut]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
