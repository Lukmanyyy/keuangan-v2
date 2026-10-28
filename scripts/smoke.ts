import assert from 'node:assert/strict';
const base=process.env.SMOKE_BASE_URL || 'http://127.0.0.1:8788';
assert.ok(['localhost','127.0.0.1'].includes(new URL(base).hostname),'Smoke test only runs against localhost; it creates test data.');
for (const path of ['/admin','/admin/settings']) {
  const response=await fetch(base+path,{redirect:'manual'});
  assert.equal(response.status,302);
  assert.equal(new URL(response.headers.get('Location')!,base).pathname,'/');
}
let cookie='';
async function call(path:string,method='GET',body?:unknown) {
  const res=await fetch(base+'/api'+path,{method,headers:{'Content-Type':'application/json','X-Uangku-Request':'1',Origin:base,Cookie:cookie},body:body===undefined?undefined:JSON.stringify(body)});
  if(res.headers.get('Set-Cookie'))cookie=res.headers.get('Set-Cookie')!.split(';')[0];
  return {status:res.status,data:await res.json() as any};
}
const health=await call('/health');assert.equal(health.status,200);
const testPassword=crypto.randomUUID();
const account=await call('/auth/register','POST',{name:'Cloudflare Smoke',email:`smoke-${crypto.randomUUID()}@example.com`,password:testPassword});
assert.equal(account.status,200,JSON.stringify(account.data));
assert.equal((await call('/auth/me')).status,200);
const wallet=await call('/wallets','POST',{name:'Smoke Cash',balance:100000});assert.equal(wallet.status,201,JSON.stringify(wallet.data));
const bank=await call('/wallets','POST',{name:'Smoke Bank',balance:0});assert.equal(bank.status,201);
const tx=await call('/transactions','POST',{type:'transfer',walletId:wallet.data.wallet.id,toWalletId:bank.data.wallet.id,merchant:'Smoke transfer',amount:25000,category:'Transfer'});
assert.equal(tx.status,201,JSON.stringify(tx.data));
assert.equal(tx.data.wallets.find((w:any)=>w.id===bank.data.wallet.id).balance,25000);
const deleted=await call(`/transactions/${tx.data.transaction.id}`,'DELETE');assert.equal(deleted.status,200);
assert.equal(deleted.data.wallets.find((w:any)=>w.id===wallet.data.wallet.id).balance,100000);
if(health.data.receiptStorage) {
  const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9uoAAAAASUVORK5CYII=';
  const receipt=await call('/transactions','POST',{type:'pengeluaran',walletId:wallet.data.wallet.id,merchant:'Smoke R2',amount:100,category:'Test',receiptImage:image});
  assert.equal(receipt.status,201,JSON.stringify(receipt.data));
  const url=base+receipt.data.transaction.receiptImage;
  const privatePhoto=await fetch(url,{headers:{Cookie:cookie}});assert.equal(privatePhoto.status,200);assert.equal(privatePhoto.headers.get('Content-Type'),'image/png');
  assert.equal((await fetch(url)).status,401);
  assert.equal((await call(`/transactions/${receipt.data.transaction.id}`,'DELETE')).status,200);
  assert.equal((await fetch(url,{headers:{Cookie:cookie}})).status,404);
}
assert.equal((await call('/admin/overview')).status,403);
assert.equal((await call('/auth/admin-login','POST',{email:account.data.user.email,password:testPassword})).status,403);
assert.equal((await call('/auth/me')).data.user.id,account.data.user.id);
assert.equal((await call('/settings','POST',{darkMode:true})).status,200);
assert.equal((await call('/settings')).data.settings.darkMode,true);
assert.equal((await call('/auth/logout','POST',{})).status,200);
assert.equal((await call('/auth/me')).status,401);
console.log(`Cloudflare smoke test passed: legacy admin redirects, auth, cookies, D1 wallets, transfer/reversal, settings, admin protection, logout${health.data.receiptStorage?', R2 private upload/read/delete':''}.`);
