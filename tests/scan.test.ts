import test from 'node:test';
import assert from 'node:assert/strict';
import { scanReceipt } from '../cloudflare/scan';
import type { Env } from '../cloudflare/api';

test('AI parsing, provider fallback, and failures never return invented receipts',async()=>{
  const original=globalThis.fetch;const env={GEMINI_API_KEY:'test-gemini',OPENAI_API_KEY:'test-openai'} as Env;
  const image={mime:'image/png',base64:'test'};
  try {
    globalThis.fetch=async()=>Response.json({candidates:[{content:{parts:[{text:JSON.stringify({merchant:'Real Receipt',amount:15000,date:'2026-10-27',category:'Belanja',items:[]})}]}}]});
    const result=await scanReceipt(env,image,'gemini');assert.equal(result.merchant,'Real Receipt');assert.equal(result.amount,15000);
    let requests=0;
    globalThis.fetch=async()=>{requests++;return requests===1?new Response('',{status:429}):Response.json({choices:[{message:{content:JSON.stringify({merchant:'Fallback Receipt',amount:25000,items:[]})}}]});};
    assert.equal((await scanReceipt(env,image,'auto')).merchant,'Fallback Receipt');assert.equal(requests,2);
    globalThis.fetch=async()=>new Response('',{status:500});
    await assert.rejects(()=>scanReceipt(env,image,'auto'),{status:502});
    globalThis.fetch=async()=>Response.json({candidates:[{content:{parts:[{text:'{"error":"not a receipt"}'}]}}]});
    await assert.rejects(()=>scanReceipt(env,image,'gemini'),{status:502});
    await assert.rejects(()=>scanReceipt({} as Env,image,'auto'),{status:503});
  }finally{globalThis.fetch=original;}
});
