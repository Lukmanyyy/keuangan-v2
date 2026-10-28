import { createRemoteJWKSet, jwtVerify } from 'jose';
import { csvCell, digest, email, hashPassword, HttpError, isValidPassword, money, password, requireValue, secretsEqual, text, verifyPassword } from './security';
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH, SESSION_TTL_SECONDS } from '../shared/auth';
import { scanReceipt } from './scan';

export interface Env {
  DB: D1Database;
  RECEIPTS_BUCKET?: R2Bucket;
  GOOGLE_CLIENT_ID?: string;
  GEMINI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  GEMINI_MODEL?: string;
  OPENAI_MODEL?: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
}
type Context = { request: Request; env: Env; waitUntil: (promise: Promise<unknown>) => void };
type Row = Record<string, any>;
const GOOGLE_KEYS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const cookieName = (request: Request) => new URL(request.url).protocol === 'https:' ? '__Host-uangku_session' : 'uangku_session';
const now = () => new Date().toISOString();
const adminEmail = (env: Env) => env.ADMIN_EMAIL?.trim().toLowerCase() || null;
const json = (value: unknown, status = 200, headers: HeadersInit = {}) => Response.json(value, {status, headers});
const safeUser = (u: Row) => ({id:u.id, name:u.name, email:u.email, avatar:u.avatar, role:u.role});
const walletView = (w: Row) => ({id:w.id, name:w.name, balance:w.balance, color:w.color, icon:w.icon, isDefault:!!w.is_default});
const txView = (t: Row) => ({id:t.id, type:t.type, walletId:t.wallet_id, toWalletId:t.to_wallet_id || undefined,
  merchant:t.merchant, amount:t.amount, date:t.date, category:t.category, notes:t.notes,
  receiptImage:t.receipt_key ? `/api/receipts/${encodeURIComponent(t.id)}` : undefined,
  items:JSON.parse(t.items_json || '[]'), reminder:!!t.reminder, createdAt:t.created_at});
function cookie(request: Request, token: string, maxAge = SESSION_TTL_SECONDS) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  const expires = new Date(maxAge>0 ? Date.now()+maxAge*1000 : 0).toUTCString();
  return `${cookieName(request)}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}; Expires=${expires}${secure}`;
}
function sessionToken(request: Request) {
  const name = cookieName(request);
  return (request.headers.get('Cookie') || '').split(';').map(x=>x.trim()).find(x=>x.startsWith(`${name}=`))?.slice(name.length+1) || '';
}
async function body(request: Request): Promise<Row> {
  requireValue(request.headers.get('Content-Type')?.includes('application/json'), 'Content-Type harus application/json', 415);
  requireValue(Number(request.headers.get('Content-Length') || 0) <= 8_000_000, 'Request terlalu besar', 413);
  // Read with a hard cap even when Content-Length is missing/chunked.
  const reader = request.body?.getReader();
  requireValue(reader, 'Body JSON wajib diisi');
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const part = await reader.read(); if (part.done) break;
    size += part.value.byteLength;
    if (size > 8_000_000) { await reader.cancel(); throw new HttpError(413, 'Request terlalu besar'); }
    chunks.push(part.value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  let parsed: any;
  try { parsed = JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new HttpError(400, 'JSON tidak valid'); }
  requireValue(parsed && typeof parsed === 'object' && !Array.isArray(parsed), 'Body JSON tidak valid');
  return parsed;
}
async function limit(env: Env, key: string, max: number, seconds: number) {
  const timestamp = Math.floor(Date.now()/1000);
  const bucket = Math.floor(timestamp/seconds);
  const row = await env.DB.prepare(`INSERT INTO rate_limits(key,count,expires_at) VALUES(?,1,?)
    ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count`).bind(`${key}:${bucket}`, (bucket+1)*seconds).first<Row>();
  requireValue(row && row.count <= max, 'Terlalu banyak permintaan. Coba lagi nanti.', 429);
}
async function checkManagedAdmin(env: Env, user: Row) {
  if (user.role!=='admin') return;
  const managed = await env.DB.prepare("SELECT value FROM app_settings WHERE key='env_admin_user_id'").first<Row>();
  if (managed?.value!==user.id) return;
  requireValue(user.email.toLowerCase()===adminEmail(env) && isValidPassword(env.ADMIN_PASSWORD),
    'Akses admin konfigurasi sudah dinonaktifkan atau berubah. Periksa konfigurasi pemilik dan login ulang.',401);
}
async function auth(request: Request, env: Env): Promise<Row> {
  const token = sessionToken(request);
  requireValue(/^[a-f0-9]{64}$/.test(token), 'Silakan login terlebih dahulu', 401);
  const user = await env.DB.prepare(`SELECT u.* FROM users u JOIN sessions s ON s.user_id=u.id
    WHERE s.token_hash=? AND s.expires_at>?`).bind(await digest(token), Math.floor(Date.now()/1000)).first<Row>();
  requireValue(user, 'Sesi berakhir. Silakan login kembali.', 401);
  await checkManagedAdmin(env,user);
  await env.DB.prepare('UPDATE users SET last_active_at=? WHERE id=? AND last_active_at<?')
    .bind(now(), user.id, new Date(Date.now()-300000).toISOString()).run();
  return user;
}
async function loginResponse(request: Request, env: Env, user: Row) {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b=>b.toString(16).padStart(2,'0')).join('');
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE expires_at<=?').bind(Math.floor(Date.now()/1000)),
    env.DB.prepare('DELETE FROM rate_limits WHERE key IN (SELECT key FROM rate_limits WHERE expires_at<=? LIMIT 100)').bind(Math.floor(Date.now()/1000)),
    env.DB.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').bind(await digest(token), user.id, Math.floor(Date.now()/1000)+SESSION_TTL_SECONDS),
  ]);
  return json({success:true, user:safeUser(user)}, 200, {'Set-Cookie':cookie(request,token)});
}
async function loginConfiguredAdmin(request: Request, env: Env, pass: string) {
  const address = adminEmail(env);
  const secret = env.ADMIN_PASSWORD;
  requireValue(address && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) && address.length<=254,
    'ADMIN_EMAIL belum valid. Periksa Variables and Secrets di Cloudflare.',503);
  requireValue(isValidPassword(secret),
    `ADMIN_PASSWORD harus diatur sebagai secret dengan ${MIN_PASSWORD_LENGTH}–${MAX_PASSWORD_LENGTH} karakter. Redeploy setelah menyimpan.`,503);
  requireValue(await secretsEqual(pass,secret),'Email/nama pengguna atau kata sandi salah',401);
  // Only proof of the deployment secret can create/promote this account.
  // Existing sessions and Google links cannot inherit the newly granted privileges.
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO users(id,name,email,password_hash,avatar,role,created_at,last_active_at)
      VALUES(?,?,?,?,?,'admin',?,?) ON CONFLICT(email) DO UPDATE SET
      password_hash=excluded.password_hash,role='admin',google_sub=NULL,last_active_at=excluded.last_active_at`)
      .bind(crypto.randomUUID(),'Administrator',address,await hashPassword(secret),'A',now(),now()),
    env.DB.prepare('INSERT OR IGNORE INTO user_settings(user_id) SELECT id FROM users WHERE email=?').bind(address),
    env.DB.prepare("UPDATE users SET role='user' WHERE id=(SELECT value FROM app_settings WHERE key='env_admin_user_id') AND email<>?").bind(address),
    env.DB.prepare("DELETE FROM sessions WHERE user_id=(SELECT value FROM app_settings WHERE key='env_admin_user_id')"),
    env.DB.prepare('DELETE FROM sessions WHERE user_id=(SELECT id FROM users WHERE email=?)').bind(address),
    env.DB.prepare("INSERT INTO app_settings(key,value) SELECT 'env_admin_user_id',id FROM users WHERE email=? ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(address),
  ]);
  const user = await env.DB.prepare('SELECT * FROM users WHERE email=?').bind(address).first<Row>();
  requireValue(user,'Akun administrator gagal disiapkan. Periksa D1.',503);
  return loginResponse(request,env,user);
}
async function wallets(env: Env, userId: string) {
  const {results} = await env.DB.prepare('SELECT * FROM wallets WHERE user_id=? ORDER BY created_at,id').bind(userId).all<Row>();
  return results.map(walletView);
}
async function settings(env: Env, userId: string) {
  const row = await env.DB.prepare('SELECT * FROM user_settings WHERE user_id=?').bind(userId).first<Row>();
  return {aiProvider:row?.ai_provider || 'auto', notifications:row ? !!row.notifications : true, darkMode:!!row?.dark_mode,
    hasOpenAiKey:!!env.OPENAI_API_KEY, hasGeminiKey:!!env.GEMINI_API_KEY, hasReceiptStorage:!!env.RECEIPTS_BUCKET};
}
export function imageBytes(value: unknown) {
  requireValue(typeof value === 'string' && value.length < 7_000_000, 'Gambar terlalu besar (maks. 5 MB)');
  const match = value.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+=*)$/);
  requireValue(match, 'Gunakan gambar JPEG, PNG, atau WebP');
  let binary: string;
  try { binary = atob(match[2]); } catch { throw new HttpError(400, 'Gambar base64 tidak valid'); }
  requireValue(binary.length > 0 && binary.length <= 5_000_000, 'Gambar kosong atau melebihi 5 MB');
  const bytes = Uint8Array.from(binary, x=>x.charCodeAt(0));
  const valid = match[1] === 'image/jpeg' ? bytes[0]===255 && bytes[1]===216 && bytes[2]===255
    : match[1] === 'image/png' ? bytes.slice(0,8).join(',')==='137,80,78,71,13,10,26,10'
    : new TextDecoder().decode(bytes.slice(0,4))==='RIFF' && new TextDecoder().decode(bytes.slice(8,12))==='WEBP';
  requireValue(valid, 'Isi file tidak sesuai format gambar');
  return {bytes, mime:match[1], base64:match[2]};
}
async function route(context: Context): Promise<Response> {
  const {request, env} = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '');
  const method = request.method;
  if (!['GET','HEAD'].includes(method)) {
    requireValue(request.headers.get('X-Uangku-Request') === '1', 'Header keamanan tidak valid', 403);
    const origin = request.headers.get('Origin');
    requireValue(!origin || origin === url.origin, 'Origin tidak diizinkan', 403);
  }
  if (path === '/api/config' && method === 'GET') {
    return json({success:true, googleClientId:env.GOOGLE_CLIENT_ID || ''});
  }
  requireValue(env.DB, 'Binding database DB belum dikonfigurasi', 503);
  if (path === '/api/health' && method === 'GET') {
    requireValue(typeof env.DB.prepare === 'function', 'Binding DB bukan database D1. Periksa jenis binding di Cloudflare.', 503);
    const checks: Array<{table:string;status:'ready'|'missing_table'|'query_failed'}> = [];
    const diagnosticId = crypto.randomUUID();
    for (const table of ['users','sessions','wallets','transactions','user_settings','app_settings','rate_limits']) {
      try {
        await env.DB.prepare(`SELECT 1 FROM ${table} LIMIT 1`).first();
        checks.push({table,status:'ready'});
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        checks.push({table,status:/no such table/i.test(detail)?'missing_table':'query_failed'});
        // Only static schema probes are logged here: no user values, tokens, or secrets.
        console.error('D1 health check failed',{diagnosticId,table,error:detail});
      }
    }
    if (checks.some(check=>check.status!=='ready')) {
      return json({success:false,database:'not_ready',message:'Pemeriksaan D1 gagal. Lihat checks untuk tabel terkait dan runtime logs dengan diagnosticId ini.',checks,diagnosticId},503);
    }
    return json({success:true, database:'ready', receiptStorage:!!env.RECEIPTS_BUCKET});
  }
  if (path.startsWith('/api/auth/') && ['register','login','google'].includes(path.split('/').pop()!) && method==='POST') {
    const ip = request.headers.get('CF-Connecting-IP') || 'local';
    await limit(env, `auth:${await digest(ip)}`, 20, 900);
    const b = await body(request);
    if (path.endsWith('/register')) {
      const name = text(b.name,'Nama',80); const address = email(b.email); const pass = password(b.password);
      requireValue(address!==adminEmail(env),'Email ini dikelola pemilik. Gunakan menu Masuk dengan password admin.',409);
      const user = {id:crypto.randomUUID(),name,email:address,avatar:name.charAt(0).toUpperCase(),role:'user'};
      requireValue(!await env.DB.prepare('SELECT id FROM users WHERE email=?').bind(address).first(), 'Email sudah terdaftar', 409);
      await env.DB.batch([
        env.DB.prepare('INSERT INTO users(id,name,email,password_hash,avatar,role,created_at,last_active_at) VALUES(?,?,?,?,?,?,?,?)')
          .bind(user.id,name,address,await hashPassword(pass),user.avatar,'user',now(),now()),
        env.DB.prepare('INSERT INTO user_settings(user_id) VALUES(?)').bind(user.id),
      ]);
      return loginResponse(request,env,user);
    }
    if (path.endsWith('/login')) {
      const identifier = text(b.email || b.username,'Email / nama',254).toLowerCase();
      requireValue(typeof b.password==='string' && b.password.length>0 && b.password.length<=128,'Kata sandi tidak valid');
      const pass = b.password;
      const user = await env.DB.prepare('SELECT * FROM users WHERE email=? OR lower(name)=? ORDER BY CASE WHEN email=? THEN 0 ELSE 1 END LIMIT 1')
        .bind(identifier,identifier,identifier).first<Row>();
      const owner = adminEmail(env);
      if (owner && (identifier===owner || user?.email.toLowerCase()===owner)) return loginConfiguredAdmin(request,env,pass);
      if (user) await checkManagedAdmin(env,user);
      // Equal-cost derivation for unknown accounts reduces account enumeration via timing.
      const dummy = 'pbkdf2-sha256$100000$dummy$' + '0'.repeat(64);
      const valid = await verifyPassword(pass,user?.password_hash || dummy);
      requireValue(user && valid, 'Email/nama pengguna atau kata sandi salah', 401);
      return loginResponse(request,env,user);
    }
    requireValue(env.GOOGLE_CLIENT_ID, 'Login Google belum dikonfigurasi', 503);
    const credential = text(b.credential,'Kredensial Google',10000);
    let payload: any;
    try { ({payload} = await jwtVerify(credential,GOOGLE_KEYS,{audience:env.GOOGLE_CLIENT_ID,issuer:['https://accounts.google.com','accounts.google.com']})); }
    catch { throw new HttpError(401,'Kredensial Google tidak valid atau kedaluwarsa'); }
    requireValue(payload.email_verified===true && typeof payload.sub==='string', 'Email Google belum diverifikasi', 401);
    const address = email(payload.email);
    requireValue(address!==adminEmail(env),'Akun admin ini menggunakan ADMIN_PASSWORD. Gunakan login email dan password.',403);
    let user = await env.DB.prepare('SELECT * FROM users WHERE google_sub=?').bind(payload.sub).first<Row>();
    if (!user) {
      requireValue(!await env.DB.prepare('SELECT id FROM users WHERE email=?').bind(address).first(),
        'Email sudah memiliki akun. Gunakan login kata sandi; penggabungan akun otomatis tidak diizinkan.',409);
      const name = text(payload.name || address.split('@')[0],'Nama',80);
      user = {id:crypto.randomUUID(),name,email:address,avatar:name.charAt(0).toUpperCase(),role:'user'};
      await env.DB.batch([
        env.DB.prepare('INSERT INTO users(id,name,email,google_sub,avatar,created_at,last_active_at) VALUES(?,?,?,?,?,?,?)')
          .bind(user.id,name,address,payload.sub,user.avatar,now(),now()),
        env.DB.prepare('INSERT INTO user_settings(user_id) VALUES(?)').bind(user.id),
      ]);
    }
    return loginResponse(request,env,user);
  }
  if (path==='/api/auth/logout' && method==='POST') {
    const token = sessionToken(request);
    if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await digest(token)).run();
    return json({success:true},200,{'Set-Cookie':cookie(request,'',0)});
  }
  const user = await auth(request,env);
  if (path==='/api/auth/me' && method==='GET') return json({success:true,user:safeUser(user)});
  if (path==='/api/auth/profile' && method==='PUT') {
    const b = await body(request); const name = text(b.name,'Nama',80);
    requireValue(!b.email || email(b.email)===user.email, 'Perubahan email memerlukan verifikasi dan belum didukung');
    await env.DB.prepare('UPDATE users SET name=?,avatar=? WHERE id=?').bind(name,name.charAt(0).toUpperCase(),user.id).run();
    return json({success:true,user:safeUser({...user,name,avatar:name.charAt(0).toUpperCase()})});
  }
  if (path==='/api/wallets' && method==='GET') return json({success:true,wallets:await wallets(env,user.id)});
  if (path==='/api/wallets' && method==='POST') {
    const b = await body(request); const id = crypto.randomUUID();
    await env.DB.prepare(`INSERT INTO wallets(id,user_id,name,balance,color,icon,is_default,created_at)
      VALUES(?,?,?,?,?,?,CASE WHEN EXISTS(SELECT 1 FROM wallets WHERE user_id=?) THEN 0 ELSE 1 END,?)`)
      .bind(id,user.id,text(b.name,'Nama kas',80),money(b.balance ?? 0,false),text(b.color || 'indigo','Warna',40),text(b.icon || 'wallet','Ikon',40),user.id,now()).run();
    const list = await wallets(env,user.id);
    return json({success:true,wallet:list.find(w=>w.id===id),wallets:list},201);
  }
  if (/^\/api\/wallets\/[^/]+$/.test(path) && ['PUT','DELETE'].includes(method)) {
    const id = decodeURIComponent(path.split('/').pop()!);
    const w = await env.DB.prepare('SELECT * FROM wallets WHERE id=? AND user_id=?').bind(id,user.id).first<Row>();
    requireValue(w,'Kas tidak ditemukan',404);
    if (method==='DELETE') {
      const used = await env.DB.prepare('SELECT id FROM transactions WHERE wallet_id=? OR to_wallet_id=? LIMIT 1').bind(id,id).first();
      requireValue(!used,'Kas masih memiliki riwayat transaksi. Hapus transaksinya terlebih dahulu.',409);
      await env.DB.batch([
        env.DB.prepare('DELETE FROM wallets WHERE id=? AND user_id=?').bind(id,user.id),
        env.DB.prepare('UPDATE wallets SET is_default=1 WHERE id=(SELECT id FROM wallets WHERE user_id=? ORDER BY created_at,id LIMIT 1) AND NOT EXISTS(SELECT 1 FROM wallets WHERE user_id=? AND is_default=1)').bind(user.id,user.id),
      ]);
    } else {
      const b = await body(request);
      await env.DB.prepare('UPDATE wallets SET name=?,balance=?,color=?,icon=? WHERE id=? AND user_id=?')
        .bind(text(b.name ?? w.name,'Nama kas',80),money(b.balance ?? w.balance,false),text(b.color ?? w.color,'Warna',40),text(b.icon ?? w.icon,'Ikon',40),id,user.id).run();
    }
    const list = await wallets(env,user.id);
    return json({success:true,wallet:list.find(x=>x.id===id),wallets:list});
  }
  if (path==='/api/transactions' && method==='GET') {
    const conditions = ['user_id=?']; const args: string[] = [user.id];
    if (url.searchParams.get('type') && url.searchParams.get('type')!=='semua') { conditions.push('type=?'); args.push(url.searchParams.get('type')!); }
    if (url.searchParams.get('walletId')) { conditions.push('(wallet_id=? OR to_wallet_id=?)'); args.push(url.searchParams.get('walletId')!,url.searchParams.get('walletId')!); }
    if (url.searchParams.get('search')) { conditions.push('(merchant LIKE ? OR category LIKE ? OR notes LIKE ?)'); const q=`%${url.searchParams.get('search')!.slice(0,100)}%`; args.push(q,q,q); }
    const offset = Number(url.searchParams.get('offset') || 0);
    requireValue(Number.isSafeInteger(offset) && offset>=0 && offset<=10000000,'Offset tidak valid');
    const {results} = await env.DB.prepare(`SELECT * FROM transactions WHERE ${conditions.join(' AND ')} ORDER BY date DESC,created_at DESC,id DESC LIMIT 500 OFFSET ?`).bind(...args,offset).all<Row>();
    return json({success:true,transactions:results.map(txView),nextOffset:results.length===500?offset+500:null});
  }
  if (path==='/api/transactions' && method==='POST') {
    const b = await body(request);
    requireValue(['pemasukan','pengeluaran','transfer'].includes(b.type),'Jenis transaksi tidak valid');
    const id = crypto.randomUUID(); const walletId = text(b.walletId,'Kas',80);
    const toWalletId = b.type==='transfer' ? text(b.toWalletId,'Kas tujuan',80) : null;
    requireValue(walletId!==toWalletId,'Kas asal dan tujuan harus berbeda');
    for (const wid of [walletId,toWalletId].filter(Boolean)) {
      requireValue(await env.DB.prepare('SELECT id FROM wallets WHERE id=? AND user_id=?').bind(wid,user.id).first(),'Kas tidak ditemukan',404);
    }
    const merchant = text(b.merchant,'Keterangan',200); const amount = money(b.amount);
    const date = new Date(text(b.date || now(),'Tanggal',50));
    requireValue(!Number.isNaN(date.getTime()),'Tanggal tidak valid');
    const category = text(b.category || 'Lain-lain','Kategori',80); const notes = text(b.notes,'Catatan',2000,false);
    requireValue(b.items===undefined || (Array.isArray(b.items) && b.items.length<=200),'Rincian barang tidak valid');
    const items = (b.items || []).map((item: Row)=>{ requireValue(item && typeof item==='object','Rincian barang tidak valid'); const price=money(item.price,false);requireValue(price>=0,'Harga barang tidak boleh negatif');return {name:text(item.name,'Nama barang',200),qty:money(item.qty),price}; });
    let receiptKey: string | null = null;
    if (b.receiptImage) {
      requireValue(env.RECEIPTS_BUCKET,'R2 belum dikonfigurasi untuk menyimpan foto',503);
      const image = imageBytes(b.receiptImage); receiptKey = `${user.id}/${id}`;
      await env.RECEIPTS_BUCKET.put(receiptKey,image.bytes,{httpMetadata:{contentType:image.mime}});
    }
    try {
      await env.DB.prepare(`INSERT INTO transactions(id,user_id,wallet_id,to_wallet_id,type,merchant,amount,date,category,notes,receipt_key,items_json,reminder,created_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,user.id,walletId,toWalletId,b.type,merchant,amount,date.toISOString(),category,notes,receiptKey,JSON.stringify(items),b.reminder?1:0,now()).run();
    } catch (error) {
      if (receiptKey) await env.RECEIPTS_BUCKET!.delete(receiptKey);
      throw error;
    }
    const tx = await env.DB.prepare('SELECT * FROM transactions WHERE id=? AND user_id=?').bind(id,user.id).first<Row>();
    return json({success:true,transaction:txView(tx!),wallets:await wallets(env,user.id)},201);
  }
  if (/^\/api\/transactions\/[^/]+$/.test(path) && method==='DELETE') {
    const id = decodeURIComponent(path.split('/').pop()!);
    const tx = await env.DB.prepare('SELECT * FROM transactions WHERE id=? AND user_id=?').bind(id,user.id).first<Row>();
    requireValue(tx,'Transaksi tidak ditemukan',404);
    await env.DB.prepare('DELETE FROM transactions WHERE id=? AND user_id=?').bind(id,user.id).run();
    if (tx.receipt_key && env.RECEIPTS_BUCKET) context.waitUntil(env.RECEIPTS_BUCKET.delete(tx.receipt_key).catch(()=>console.error('Receipt cleanup failed')));
    return json({success:true,wallets:await wallets(env,user.id)});
  }
  if (/^\/api\/receipts\/[^/]+$/.test(path) && method==='GET') {
    const id = decodeURIComponent(path.split('/').pop()!);
    const tx = await env.DB.prepare('SELECT receipt_key FROM transactions WHERE id=? AND user_id=?').bind(id,user.id).first<Row>();
    requireValue(tx?.receipt_key && env.RECEIPTS_BUCKET,'Foto tidak ditemukan',404);
    const object = await env.RECEIPTS_BUCKET.get(tx.receipt_key);
    requireValue(object,'Foto tidak ditemukan',404);
    return new Response(object.body,{headers:{'Content-Type':object.httpMetadata?.contentType || 'application/octet-stream','Content-Disposition':'inline'}});
  }
  if (path==='/api/settings' && method==='GET') return json({success:true,settings:await settings(env,user.id)});
  if (path==='/api/categories' && method==='GET') {
    const row = await env.DB.prepare('SELECT categories_json FROM user_settings WHERE user_id=?').bind(user.id).first<Row>();
    return json({success:true,categories:row?.categories_json ? JSON.parse(row.categories_json) : null});
  }
  if (path==='/api/categories' && method==='PUT') {
    const b = await body(request);
    requireValue(Array.isArray(b.categories) && b.categories.length>0 && b.categories.length<=200,'Daftar kategori tidak valid');
    const categories = b.categories.map((c:Row)=>{
      requireValue(c && ['pemasukan','pengeluaran'].includes(c.type),'Jenis kategori tidak valid');
      return {id:text(c.id,'ID kategori',80),name:text(c.name,'Kategori',80),icon:text(c.icon,'Ikon',40),color:text(c.color,'Warna',40),type:c.type,isCustom:!!c.isCustom};
    });
    requireValue(new Set(categories.map((c:Row)=>c.id)).size===categories.length,'ID kategori harus unik');
    await env.DB.prepare('INSERT INTO user_settings(user_id,categories_json) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET categories_json=excluded.categories_json').bind(user.id,JSON.stringify(categories)).run();
    return json({success:true,categories});
  }
  if (path==='/api/settings' && method==='POST') {
    const b = await body(request); const old = await settings(env,user.id);
    requireValue(!b.openaiApiKey && !b.geminiApiKey,'Simpan API key hanya di Cloudflare Secrets');
    requireValue(b.aiProvider===undefined || ['auto','gemini','chatgpt'].includes(b.aiProvider),'Provider AI tidak valid');
    requireValue(b.notifications===undefined || typeof b.notifications==='boolean','Notifikasi tidak valid');
    requireValue(b.darkMode===undefined || typeof b.darkMode==='boolean','Mode tampilan tidak valid');
    await env.DB.prepare(`INSERT INTO user_settings(user_id,ai_provider,notifications,dark_mode) VALUES(?,?,?,?)
      ON CONFLICT(user_id) DO UPDATE SET ai_provider=excluded.ai_provider,notifications=excluded.notifications,dark_mode=excluded.dark_mode`)
      .bind(user.id,b.aiProvider ?? old.aiProvider,(b.notifications ?? old.notifications)?1:0,(b.darkMode ?? old.darkMode)?1:0).run();
    return json({success:true,settings:await settings(env,user.id)});
  }
  if (path==='/api/scan-receipt' && method==='POST') {
    await limit(env,`scan:${user.id}`,20,3600);
    await limit(env,'scan:global',200,86400);
    const b = await body(request); const image = imageBytes(b.imageBase64);
    const global = await env.DB.prepare("SELECT value FROM app_settings WHERE key='ai_provider'").first<Row>();
    const preference = global?.value || (await settings(env,user.id)).aiProvider;
    return json({success:true,data:await scanReceipt(env,image,preference)});
  }
  if (path==='/api/export/report' && ['GET','POST'].includes(method)) {
    const b = method==='POST' ? await body(request) : Object.fromEntries(url.searchParams);
    const conditions = ['user_id=?']; const args = [user.id];
    for (const [key,op] of [['startDate','>='],['endDate','<=']]) {
      if (b[key]) { const d = new Date(b[key]); requireValue(!Number.isNaN(d.getTime()),'Periode laporan tidak valid');
        conditions.push(`date ${op} ?`); args.push(d.toISOString()); }
    }
    const {results} = await env.DB.prepare(`SELECT * FROM transactions WHERE ${conditions.join(' AND ')} ORDER BY date DESC LIMIT 10001`).bind(...args).all<Row>();
    requireValue(results.length<=10000,'Ekspor API maksimal 10.000 transaksi per permintaan. Pilih rentang tanggal lebih pendek.',413);
    const list = await wallets(env,user.id); const transactions = results.map(txView);
    if (b.format==='csv') {
      const rows = [['ID','Tanggal','Jenis','Keterangan','Kategori','Kas','Jumlah','Catatan'],...transactions.map(t=>[t.id,t.date,t.type,t.merchant,t.category,list.find(w=>w.id===t.walletId)?.name,t.amount,t.notes])];
      return new Response('\uFEFF'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n'),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="laporan-uangku.csv"'}});
    }
    const income = transactions.filter(t=>t.type==='pemasukan').reduce((s,t)=>s+t.amount,0);
    const expense = transactions.filter(t=>t.type==='pengeluaran').reduce((s,t)=>s+t.amount,0);
    return json({success:true,report:{transactions,wallets:list,summary:{totalIncome:income,totalExpense:expense,netBalance:income-expense,transactionCount:transactions.length},generatedAt:now()}});
  }
  if (path.startsWith('/api/admin/')) {
    requireValue(user.role==='admin','Akses khusus administrator',403);
    if (path==='/api/admin/overview' && method==='GET') {
      const {results:users} = await env.DB.prepare(`SELECT u.id,u.name,u.email,u.avatar,u.role,u.created_at AS createdAt,u.last_active_at AS lastActiveAt,
        (SELECT count(*) FROM wallets w WHERE w.user_id=u.id) AS walletsCount,
        (SELECT count(*) FROM transactions t WHERE t.user_id=u.id) AS transactionsCount,
        (SELECT coalesce(sum(balance),0) FROM wallets w WHERE w.user_id=u.id) AS totalBalance FROM users u ORDER BY u.created_at DESC LIMIT 1000`).all<Row>();
      const stats = await env.DB.prepare(`SELECT (SELECT count(*) FROM users) AS totalUsers,
        (SELECT count(*) FROM users WHERE last_active_at>?) AS activeUsersToday,
        (SELECT count(*) FROM wallets) AS totalWallets,(SELECT count(*) FROM transactions) AS totalTransactions,
        (SELECT coalesce(sum(balance),0) FROM wallets) AS totalSystemBalance`).bind(new Date(Date.now()-86400000).toISOString()).first();
      const provider = await env.DB.prepare("SELECT value FROM app_settings WHERE key='ai_provider'").first<Row>();
      return json({success:true,users,stats,globalAiSettings:{aiProvider:provider?.value || 'auto',hasOpenAiKey:!!env.OPENAI_API_KEY,hasGeminiKey:!!env.GEMINI_API_KEY}});
    }
    if (path==='/api/admin/reset-password' && method==='POST') {
      const b = await body(request); const userId = text(b.userId,'Pengguna',80); const pass = password(b.newPassword);
      const target = await env.DB.prepare('SELECT id,email FROM users WHERE id=?').bind(userId).first<Row>();
      requireValue(target,'Pengguna tidak ditemukan',404);
      requireValue(target.email.toLowerCase()!==adminEmail(env),'Password akun ini dikelola melalui secret ADMIN_PASSWORD di Cloudflare. Ubah secret lalu login ulang.');
      await env.DB.batch([
        env.DB.prepare('UPDATE users SET password_hash=? WHERE id=?').bind(await hashPassword(pass),userId),
        env.DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(userId),
      ]);
      return json({success:true,message:'Kata sandi direset dan seluruh sesi pengguna dicabut.'});
    }
    if (path==='/api/admin/ai-settings' && method==='POST') {
      const b = await body(request);
      requireValue(!b.openaiApiKey && !b.geminiApiKey,'API key hanya boleh diatur melalui Cloudflare Secrets');
      requireValue(['auto','gemini','chatgpt'].includes(b.aiProvider),'Provider tidak valid');
      await env.DB.prepare("INSERT INTO app_settings(key,value) VALUES('ai_provider',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(b.aiProvider).run();
      return json({success:true,message:'Provider AI disimpan.'});
    }
    if (/^\/api\/admin\/users\/[^/]+$/.test(path) && method==='DELETE') {
      const id = decodeURIComponent(path.split('/').pop()!);
      requireValue(id!==user.id,'Tidak dapat menghapus akun admin sendiri');
      const target = await env.DB.prepare('SELECT id,email FROM users WHERE id=?').bind(id).first<Row>();
      requireValue(target,'Pengguna tidak ditemukan',404);
      requireValue(target.email.toLowerCase()!==adminEmail(env),'Akun admin konfigurasi tidak dapat dihapus melalui panel. Kelola ADMIN_EMAIL di Cloudflare terlebih dahulu.');
      const {results} = await env.DB.prepare('SELECT receipt_key FROM transactions WHERE user_id=? AND receipt_key IS NOT NULL').bind(id).all<Row>();
      await env.DB.batch([
        env.DB.prepare('DELETE FROM transactions WHERE user_id=?').bind(id),
        env.DB.prepare('DELETE FROM wallets WHERE user_id=?').bind(id),
        env.DB.prepare('DELETE FROM users WHERE id=?').bind(id),
      ]);
      if (env.RECEIPTS_BUCKET && results.length) context.waitUntil((async()=>{
        for (let i=0;i<results.length;i+=500) await env.RECEIPTS_BUCKET!.delete(results.slice(i,i+500).map(r=>r.receipt_key));
      })().catch(()=>console.error('Receipt cleanup failed')));
      return json({success:true,message:'Akun dan data pengguna dihapus.'});
    }
  }
  throw new HttpError(404,'Endpoint tidak ditemukan');
}
export async function handleRequest(context: Context): Promise<Response> {
  let response: Response;
  try { response = await route(context); }
  catch (error) {
    let status = error instanceof HttpError ? error.status : 500;
    let message = error instanceof HttpError ? error.message : 'Kesalahan server. Periksa binding, migration, dan log Cloudflare.';
    if (!(error instanceof HttpError)) {
      const detail = String(error);
      if (detail.includes('UNIQUE constraint failed')) { status=409; message='Data sudah ada. Muat ulang dan coba kembali.'; }
      else if (detail.includes('FOREIGN KEY constraint failed')) { status=409; message='Data masih digunakan atau sudah berubah. Muat ulang halaman.'; }
      else if (detail.includes('CHECK constraint failed')) { status=400; message='Data atau saldo melewati batas yang diizinkan.'; }
      console.error('API error', error instanceof Error ? error.name : 'Unknown');
    }
    response = json({success:false,message},status,status===429 ? {'Retry-After':'900'} : {});
  }
  const headers = new Headers(response.headers);
  headers.set('Cache-Control','no-store'); headers.set('X-Content-Type-Options','nosniff');
  headers.set('Referrer-Policy','same-origin'); headers.set('Cross-Origin-Resource-Policy','same-origin');
  return new Response(response.body,{status:response.status,headers});
}
