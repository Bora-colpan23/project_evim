// Derlenmiş sayfaları sertleştirir: içerik güvenlik politikası (CSP), çerçeve koruması, referrer
// politikası, manifest ve simgeler. GitHub Pages yanıt başlığı (header) ayarlayamadığı için
// koruma <meta> ile verilir. Kullanım: node scripts/harden-html.mjs <çıktı klasörü>
//
// CSP'de satır içi betikler özetle (sha256) izinlidir; özetler her sayfada gerçek betik
// metninden hesaplanır, 'unsafe-inline' (betik için) hiçbir zaman kullanılmaz.
//
// Ortam: EXPO_PUBLIC_SUPABASE_URL (API ve gerçek zamanlı bağlantı kaynağı), EXPO_PUBLIC_TURNSTILE_SITE_KEY
// (varsa Cloudflare Turnstile için gerekli kaynaklar), EXPO_BASE_URL (GitHub Pages proje yolu).
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2];
if (!out) { console.error('Kullanım: node scripts/harden-html.mjs <klasör>'); process.exit(1); }

const base = (process.env.EXPO_BASE_URL || '').replace(/\/$/, '');
const origin = (u) => { try { return u && /^https?:/.test(u) ? new URL(u).origin : ''; } catch { return ''; } };
const api = origin(process.env.EXPO_PUBLIC_SUPABASE_URL);
const ws = api ? api.replace(/^http/, 'ws') : '';
const turnstile = process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY ? 'https://challenges.cloudflare.com' : '';

/** Sayfa başka bir sitenin içine gömülürse (clickjacking) gizlenir ve üst pencereye açılır. */
const FRAME_GUARD = "if(window.top!==window.self){document.documentElement.style.display='none';try{window.top.location=window.self.location}catch(e){}}";

const sha = (s) => `'sha256-${createHash('sha256').update(s).digest('base64')}'`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

function csp(hashes) {
  return [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(' ')} ${turnstile}`.trim(),
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${api}`.trim(),
    "font-src 'self' data:",
    `connect-src 'self' blob: data: ${api} ${ws} ${turnstile}`.replace(/\s+/g, ' ').trim(),
    `media-src 'self' blob: data: ${api}`.trim(),
    turnstile ? `frame-src ${turnstile}` : "frame-src 'none'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
}

const inline = (html) => [...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return n === '_expo' || n === 'assets' ? [] : walk(p);
    return n.endsWith('.html') ? [p] : [];
  });
}

let count = 0;
for (const file of walk(out)) {
  let html = readFileSync(file, 'utf8');
  if (html.includes('http-equiv="Content-Security-Policy"')) continue;      // zaten sertleştirilmiş
  html = html.replace('<html lang="en">', '<html lang="tr">');
  const guard = `<script>${FRAME_GUARD}</script>`;
  const hashes = [...new Set([...inline(html), FRAME_GUARD].map(sha))];
  const head = [
    `<meta http-equiv="Content-Security-Policy" content="${esc(csp(hashes))}"/>`,
    '<meta name="referrer" content="strict-origin-when-cross-origin"/>',
    '<meta name="theme-color" content="#FBF4EA"/>',
    '<meta name="apple-mobile-web-app-capable" content="yes"/>',
    '<meta name="apple-mobile-web-app-title" content="Kiracım"/>',
    '<meta name="apple-mobile-web-app-status-bar-style" content="default"/>',
    `<link rel="manifest" href="${base}/manifest.webmanifest"/>`,
    `<link rel="apple-touch-icon" href="${base}/apple-touch-icon.png"/>`
  ].join('');
  // CSP en başta olmalı ki sonraki kaynaklara da uygulansın; çerçeve koruması hemen ardından.
  html = html.replace('<head>', `<head>${head}${guard}`);
  writeFileSync(file, html);
  count++;
}
console.log(`harden-html: ${count} sayfa sertleştirildi`);
