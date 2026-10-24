import { useState } from 'react';
import { View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import AuthShell from '../auth/AuthShell';
import { useAuth } from '../auth/auth';
import { t } from '../domain/i18n';
import { Button, Field, PressScale, Text } from '../ui/kit';
import { useColors } from '../ui/theme';

export default function Giris() {
  const { user, ready, signIn, live } = useAuth();
  const router = useRouter();
  const c = useColors();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (ready && user) return <Redirect href="/uygulama" />;
  const submit = async () => { setBusy(true); setErr(null); const e = await signIn(email, pw); setBusy(false); if (e) setErr(e); else router.replace('/uygulama'); };
  return (
    <AuthShell title={t('Giriş yap')} lead={live ? undefined : t('Bu sürümde hesap bu cihazda tutulur. Sunucu kurulunca hesaplar cihazlar arası çalışır.')}>
      <Field label={t('E-posta')} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />
      <Field label={t('Şifre')} value={pw} onChangeText={setPw} secureTextEntry autoComplete="current-password" textContentType="password" onSubmitEditing={submit} error={err} />
      <Button block title={t('Giriş yap')} onPress={submit} loading={busy} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <PressScale onPress={() => router.push('/sifre')} accessibilityRole="link"><Text v="small" color={c.accent} style={{ fontWeight: '700' }}>{t('Şifremi unuttum')}</Text></PressScale>
        <PressScale onPress={() => router.push('/kayit')} accessibilityRole="link"><Text v="small" color={c.accent} style={{ fontWeight: '700' }}>{t('Hesabın yok mu? Kayıt ol')}</Text></PressScale>
      </View>
    </AuthShell>
  );
}
