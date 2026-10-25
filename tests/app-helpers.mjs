// Kiracım uygulaması (app/) için ortak test yardımcıları: statik sunucu ve sahte Supabase verisi.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.ico': 'image/x-icon', '.ttf': 'font/ttf', '.svg': 'image/svg+xml', '.map': 'application/json' };

/** dist klasörünü sunar; /admin → admin/index.html ya da admin.html. */
export function serveDist(root, port) {
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const tries = [path, path + '.html', join(path, 'index.html')];
    for (const p of tries) {
      try {
        const f = join(root, p);
        if ((await stat(f)).isFile()) {
          res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' });
          return res.end(await readFile(f));
        }
      } catch {}
    }
    try { res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' }); res.end(await readFile(join(root, '+not-found.html'))); } catch { res.end('404'); }
  });
  return new Promise(ok => server.listen(port, () => ok(server)));
}

export const ID = {
  landlord: '00000000-0000-4000-8000-00000000000a',
  tenant: '00000000-0000-4000-8000-00000000000b',
  admin: '00000000-0000-4000-8000-00000000000e'
};
export const PW = 'gizli-sifre-1';

/** Sahte veritabanı (localStorage.__fakedb): mülk sahibi, kiracı, yönetici ve bir mülk. */
export function seed() {
  const created = new Date().toISOString();
  const start = created.slice(0, 8) + '01';
  const end = (Number(created.slice(0, 4)) + 1) + created.slice(4, 8) + '01';
  const user = (id, email, name, role) => ({ users: { id, email, password: PW, meta: { name, role } }, profile: { id, role, name, phone: '', lang: 'tr', settings: {}, created_at: created } });
  const L = user(ID.landlord, 'ev@ornek.com', 'Ayşe Mülk', 'landlord');
  const T = user(ID.tenant, 'kiraci@ornek.com', 'Mehmet Kiracı', 'tenant');
  const A = user(ID.admin, 'admin@ornek.com', 'Yönetici', 'tenant');
  return {
    users: [L.users, T.users, A.users], session: null, storage: {},
    tables: {
      profiles: [L.profile, T.profile, A.profile],
      admins: [{ user_id: ID.admin }],
      properties: [{ id: 'p1', owner_id: ID.landlord, name: 'Moda Dairesi', addr: 'Kadıköy', rent: 30000, due_day: 5, aidat: 0, aidat_payer: 'Kiracı', deposit: 0, deposit_note: '', start_date: start, contract_end: end, dask: end, value: null, bills: [], prop_type: 'Konut', created_at: created }],
      property_shared: [{ property_id: 'p1', inspect: { tenantOk: false, landlordOk: false, rooms: [] }, move_out: null, renewal: null }],
      memberships: [
        { property_id: 'p1', user_id: ID.landlord, role: 'landlord', display_name: 'Ayşe Mülk', phone: '', email: '' },
        { property_id: 'p1', user_id: ID.tenant, role: 'tenant', display_name: 'Mehmet Kiracı', phone: '', email: 'kiraci@ornek.com' }
      ],
      rent_history: [{ id: 'p1:' + start, property_id: 'p1', from_date: start, amount: 30000, note: 'Sözleşme başlangıcı' }],
      invites: [], payments: [], requests: [], messages: [], documents: [], expenses: [], notifications: [],
      push_subscriptions: [], subscriptions: [], device_tokens: [], reviews: [], bans: [], admin_audit: []
    }
  };
}
