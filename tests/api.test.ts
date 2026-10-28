import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { handleRequest, type Env } from '../cloudflare/api';
import { digest } from '../cloudflare/security';

// Real SQLite with the production migration, not a SQL-string mock.
// A separate Wrangler smoke test checks compatibility with workerd/D1.
function fixture() {
  const sqlite=new DatabaseSync(':memory:');sqlite.exec('PRAGMA foreign_keys=ON');
  sqlite.exec(readFileSync(new URL('../migrations/0001_initial.sql',import.meta.url),'utf8'));
  const query=(sql:string,args:any[]=[]):any=>({
    bind:(...values:any[])=>query(sql,values),
    first:async()=>sqlite.prepare(sql).get(...args) || null,
    all:async()=>({results:sqlite.prepare(sql).all(...args),success:true}),
    run:async()=>{const result=sqlite.prepare(sql).run(...args);return {success:true,meta:{changes:Number(result.changes)}};},
  });
  const env={DB:{prepare:query,batch:async(statements:any[])=>{sqlite.exec('BEGIN');try{const results=[];for(const statement of statements)results.push(await statement.run());sqlite.exec('COMMIT');return results;}catch(e){sqlite.exec('ROLLBACK');throw e;}}}} as unknown as Env;
  const pending:Promise<unknown>[]=[];
  const call=async(path:string,method='GET',data?:unknown,cookie='',extra:Record<string,string>={})=>{
    const response=await handleRequest({env,request:new Request(`https://uangku.test/api${path}`,{method,headers:{'Content-Type':'application/json','X-Uangku-Request':'1',Origin:'https://uangku.test','CF-Connecting-IP':crypto.randomUUID(),Cookie:cookie,...extra},body:data===undefined?undefined:JSON.stringify(data)}),waitUntil:p=>pending.push(p)});
    const result:any=response.headers.get('Content-Type')?.includes('application/json')?await response.json():await response.text();
    return {response,data:result};
  };
  const account=async(name:string)=>{
    const result=await call('/auth/register','POST',{name,email:`${name}@example.com`,password:'Safe Password 123'});
    assert.equal(result.response.status,200);const cookie=result.response.headers.get('Set-Cookie')!.split(';')[0];return {cookie,user:result.data.user};
  };
  return {sqlite,env,call,account,pending};
}
test('auth, secure sessions, ownership, atomic balances and transfer reversal',async()=>{
  const f=fixture();try{
    assert.equal((await f.call('/health')).response.status,200);
    assert.equal((await f.call('/wallets')).response.status,401);
    const a=await f.account('alice');const b=await f.account('bob');
    assert.equal((await f.call('/auth/me','GET',undefined,a.cookie)).data.user.id,a.user.id);
    const session=f.sqlite.prepare('SELECT token_hash FROM sessions WHERE user_id=?').get(a.user.id) as any;
    assert.equal(session.token_hash,await digest(a.cookie.split('=')[1]));
    const create=async(name:string,balance:number,cookie=a.cookie)=>(await f.call('/wallets','POST',{name,balance},cookie)).data.wallet;
    const cash=await create('Cash',100000);const bank=await create('Bank',0);const other=await create('Bob',500,b.cookie);
    const tx={type:'transfer',walletId:cash.id,toWalletId:bank.id,merchant:'Transfer',amount:25000,date:'2026-10-27',category:'Transfer'};
    assert.equal((await f.call('/transactions','POST',{...tx,toWalletId:other.id},a.cookie)).response.status,404);
    assert.equal((await f.call('/transactions','POST',{...tx,toWalletId:cash.id},a.cookie)).response.status,400);
    const saved=await f.call('/transactions','POST',tx,a.cookie);assert.equal(saved.response.status,201);
    assert.equal(saved.data.wallets.find((w:any)=>w.id===cash.id).balance,75000);assert.equal(saved.data.wallets.find((w:any)=>w.id===bank.id).balance,25000);
    assert.equal((await f.call(`/transactions/${saved.data.transaction.id}`,'DELETE',undefined,b.cookie)).response.status,404);
    assert.equal((await f.call(`/wallets/${cash.id}`,'DELETE',undefined,a.cookie)).response.status,409);
    const reversed=await f.call(`/transactions/${saved.data.transaction.id}`,'DELETE',undefined,a.cookie);
    assert.equal(reversed.data.wallets.find((w:any)=>w.id===cash.id).balance,100000);assert.equal(reversed.data.wallets.find((w:any)=>w.id===bank.id).balance,0);
    await f.call(`/transactions/${saved.data.transaction.id}`,'DELETE',undefined,a.cookie);
    assert.equal((await f.call('/wallets','GET',undefined,a.cookie)).data.wallets.find((w:any)=>w.id===cash.id).balance,100000);
    const income=await f.call('/transactions','POST',{...tx,type:'pemasukan',amount:10000},a.cookie);
    assert.equal(income.data.wallets.find((w:any)=>w.id===cash.id).balance,110000);
    await f.call(`/transactions/${income.data.transaction.id}`,'DELETE',undefined,a.cookie);
    const expense=await f.call('/transactions','POST',{...tx,type:'pengeluaran',amount:5000},a.cookie);
    assert.equal(expense.data.wallets.find((w:any)=>w.id===cash.id).balance,95000);
    assert.equal((await f.call('/transactions','POST',{...tx,amount:-10},a.cookie)).response.status,400);
    assert.equal((await f.call('/transactions','POST',{...tx,items:[null]},a.cookie)).response.status,400);
    assert.equal((await f.call('/wallets','POST',{name:'CSRF'},a.cookie,{Origin:'https://evil.test'})).response.status,403);
    const loggedOut=await f.call('/auth/logout','POST',{},a.cookie);assert.ok(loggedOut.response.headers.get('Set-Cookie')?.includes('Max-Age=0'));
    assert.equal((await f.call('/auth/me','GET',undefined,a.cookie)).response.status,401);
    const login=await f.call('/auth/login','POST',{email:'alice@example.com',password:'Safe Password 123'});assert.equal(login.response.status,200);
    assert.ok(login.response.headers.get('Set-Cookie')?.includes('HttpOnly'));assert.ok(login.response.headers.get('Set-Cookie')?.includes('Secure'));
    assert.equal((await f.call('/auth/login','POST',{email:'alice@example.com',password:'wrong'})).response.status,401);
  }finally{f.sqlite.close();}
});
test('admin authorization, secret redaction, reset revokes sessions, user deletion',async()=>{
  const f=fixture();try{
    const admin=await f.account('owner');const member=await f.account('member');
    assert.equal((await f.call('/admin/overview','GET',undefined,admin.cookie)).response.status,403);
    f.sqlite.prepare("UPDATE users SET role='admin' WHERE id=?").run(admin.user.id);
    f.env.GEMINI_API_KEY='never-return-this-secret';
    const overview=await f.call('/admin/overview','GET',undefined,admin.cookie);assert.equal(overview.response.status,200);
    const serialized=JSON.stringify(overview.data);assert.ok(!serialized.includes('never-return-this-secret'));assert.ok(!serialized.includes('password_hash'));assert.ok(!serialized.includes('Safe Password'));
    assert.equal((await f.call('/admin/reset-password','POST',{userId:member.user.id,newPassword:'New Password 123'},member.cookie)).response.status,403);
    assert.equal((await f.call('/admin/reset-password','POST',{userId:member.user.id,newPassword:'New Password 123'},admin.cookie)).response.status,200);
    assert.equal((await f.call('/auth/me','GET',undefined,member.cookie)).response.status,401);
    assert.equal((await f.call('/auth/login','POST',{email:member.user.email,password:'New Password 123'})).response.status,200);
    assert.equal((await f.call(`/admin/users/${admin.user.id}`,'DELETE',undefined,admin.cookie)).response.status,400);
    assert.equal((await f.call(`/admin/users/${member.user.id}`,'DELETE',undefined,admin.cookie)).response.status,200);
    assert.equal(f.sqlite.prepare('SELECT count(*) AS n FROM sessions WHERE user_id=?').get(member.user.id)?.n,0);
  }finally{f.sqlite.close();}
});
test('settings, categories, CSV escaping, R2 ownership and no fake AI fallback',async()=>{
  const f=fixture();try{
    const a=await f.account('receipt');const b=await f.account('different');
    const objects=new Map<string,{bytes:Uint8Array;mime:string}>();
    f.env.RECEIPTS_BUCKET={put:async(key:string,bytes:Uint8Array,options:any)=>objects.set(key,{bytes,mime:options.httpMetadata.contentType}),get:async(key:string)=>{const obj=objects.get(key);return obj?{body:obj.bytes,httpMetadata:{contentType:obj.mime}}:null;},delete:async(key:string)=>{objects.delete(key);}} as unknown as R2Bucket;
    assert.equal((await f.call('/settings','POST',{darkMode:true,aiProvider:'gemini'},a.cookie)).data.settings.darkMode,true);
    assert.equal((await f.call('/settings','POST',{geminiApiKey:'do-not-store'},a.cookie)).response.status,400);
    const categories=[{id:'custom',name:'Hobi',type:'pengeluaran',icon:'Tag',color:'blue'}];
    assert.equal((await f.call('/categories','PUT',{categories},a.cookie)).response.status,200);
    assert.equal((await f.call('/categories','GET',undefined,a.cookie)).data.categories[0].name,'Hobi');
    assert.equal((await f.call('/categories','GET',undefined,b.cookie)).data.categories,null);
    const wallet=(await f.call('/wallets','POST',{name:'Cash'},a.cookie)).data.wallet;
    const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9uoAAAAASUVORK5CYII=';
    const tx=await f.call('/transactions','POST',{type:'pengeluaran',walletId:wallet.id,merchant:'=SUM(A1)',amount:100,date:'2026-10-27',category:'Hobi',receiptImage:image},a.cookie);
    assert.equal(tx.response.status,201);assert.equal(objects.size,1);
    const receipt=tx.data.transaction.receiptImage.replace('/api','');
    assert.equal((await f.call(receipt,'GET',undefined,b.cookie)).response.status,404);
    assert.equal((await f.call(receipt,'GET',undefined,a.cookie)).response.status,200);
    const csv=await f.call('/export/report?format=csv','GET',undefined,a.cookie);assert.equal(csv.response.status,200);assert.ok(csv.data.includes("'=SUM(A1)"));
    assert.equal((await f.call('/scan-receipt','POST',{imageBase64:image},a.cookie)).response.status,503);
    assert.equal((await f.call('/auth/google','POST',{email:'forged@example.com',name:'Fake'},a.cookie)).response.status,503);
    f.env.GOOGLE_CLIENT_ID='test-client';
    assert.equal((await f.call('/auth/google','POST',{email:'forged@example.com',name:'Fake'},a.cookie)).response.status,400);
    assert.equal((await f.call('/auth/google','POST',{credential:'forged.invalid.token'},a.cookie)).response.status,401);
    await f.call(`/transactions/${tx.data.transaction.id}`,'DELETE',undefined,a.cookie);await Promise.all(f.pending);assert.equal(objects.size,0);
    assert.equal((await f.call('/unknown','GET',undefined,a.cookie)).response.status,404);
  }finally{f.sqlite.close();}
});
test('rate limiting blocks repeated login attempts',async()=>{
  const f=fixture();try{
    for(let i=0;i<20;i++)assert.equal((await f.call('/auth/login','POST',{email:'nobody@example.com',password:'wrong'},'',{'CF-Connecting-IP':'192.0.2.1'})).response.status,401);
    assert.equal((await f.call('/auth/login','POST',{email:'nobody@example.com',password:'wrong'},'',{'CF-Connecting-IP':'192.0.2.1'})).response.status,429);
  }finally{f.sqlite.close();}
});
test('database triggers reject cross-account writes and roll back both transfer balances',async()=>{
  const f=fixture();try {
    const a=await f.account('atomic');const b=await f.account('outsider');
    const source=(await f.call('/wallets','POST',{name:'Source',balance:1000},a.cookie)).data.wallet;
    const target=(await f.call('/wallets','POST',{name:'Target'},a.cookie)).data.wallet;
    const alien=(await f.call('/wallets','POST',{name:'Alien'},b.cookie)).data.wallet;
    const insert=f.sqlite.prepare("INSERT INTO transactions(id,user_id,wallet_id,to_wallet_id,type,merchant,amount,date,category,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)");
    assert.throws(()=>insert.run('bad-owner',a.user.id,source.id,alien.id,'transfer','Invalid',100,'2026-10-27','Transfer','2026-10-27'),/ownership/);
    f.sqlite.prepare('UPDATE wallets SET balance=9000000000000 WHERE id=?').run(target.id);
    const failed=await f.call('/transactions','POST',{type:'transfer',walletId:source.id,toWalletId:target.id,merchant:'Overflow',amount:100,category:'Transfer'},a.cookie);
    assert.equal(failed.response.status,400);
    assert.equal(f.sqlite.prepare('SELECT balance FROM wallets WHERE id=?').get(source.id)?.balance,1000);
    assert.equal(f.sqlite.prepare('SELECT count(*) AS n FROM transactions').get()?.n,0);
  }finally{f.sqlite.close();}
});
test('password whitespace is preserved and expired sessions cannot authenticate',async()=>{
  const f=fixture();try {
    const pass='  password with spaces  ';
    assert.equal((await f.call('/auth/register','POST',{name:'Whitespace',email:'spaces@example.com',password:pass})).response.status,200);
    const login=await f.call('/auth/login','POST',{email:'spaces@example.com',password:pass});assert.equal(login.response.status,200);
    const cookie=login.response.headers.get('Set-Cookie')!.split(';')[0];
    assert.equal((await f.call('/wallets','POST',{name:'Blocked'},cookie,{'X-Uangku-Request':''})).response.status,403);
    f.sqlite.prepare('UPDATE sessions SET expires_at=0').run();
    assert.equal((await f.call('/auth/me','GET',undefined,cookie)).response.status,401);
  }finally{f.sqlite.close();}
});
test('health reports the failing table without exposing database errors publicly',async()=>{
  const f=fixture();try {
    f.sqlite.exec('DROP TABLE rate_limits');
    const result=await f.call('/health');
    assert.equal(result.response.status,503);
    assert.equal(result.data.database,'not_ready');
    assert.equal(result.data.checks.find((c:any)=>c.table==='rate_limits').status,'missing_table');
    assert.equal(result.data.checks.find((c:any)=>c.table==='users').status,'ready');
    assert.ok(result.data.diagnosticId);
    assert.ok(!JSON.stringify(result.data).includes('no such table'));
  }finally{f.sqlite.close();}
});
