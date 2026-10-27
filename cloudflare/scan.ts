import type { Env } from './api';
import { HttpError, requireValue, text } from './security';

export async function scanReceipt(env: Env, image: {mime:string;base64:string}, provider: string) {
  const prompt = `Baca struk pada gambar. Kembalikan JSON saja: {"merchant":"nama toko","amount":10000,"date":"YYYY-MM-DD","category":"Belanja","items":[{"name":"barang","qty":1,"price":10000}],"notes":""}. Nominal integer rupiah. Jika bukan struk yang terbaca, kembalikan {"error":"Struk tidak terbaca"}. Jangan membuat data fiktif.`;
  const engines: Array<()=>Promise<{raw:string;engine:string}>> = [];
  if (provider!=='chatgpt' && env.GEMINI_API_KEY) engines.push(async()=>{
    const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{
      method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY!},
      signal:AbortSignal.timeout(45000),
      body:JSON.stringify({contents:[{parts:[{inlineData:{mimeType:image.mime,data:image.base64}},{text:prompt}]}],generationConfig:{responseMimeType:'application/json'}}),
    });
    if (!res.ok) throw new Error(`Gemini status ${res.status}`);
    const data: any = await res.json();
    return {raw:data.candidates?.[0]?.content?.parts?.map((p:any)=>p.text || '').join('') || '',engine:`Gemini (${model})`};
  });
  if (provider!=='gemini' && env.OPENAI_API_KEY) engines.push(async()=>{
    const model = env.OPENAI_MODEL || 'gpt-4o-mini';
    const res = await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${env.OPENAI_API_KEY}`},signal:AbortSignal.timeout(45000),
      body:JSON.stringify({model,messages:[{role:'user',content:[{type:'text',text:prompt},{type:'image_url',image_url:{url:`data:${image.mime};base64,${image.base64}`}}]}],response_format:{type:'json_object'}}),
    });
    if (!res.ok) throw new Error(`OpenAI status ${res.status}`);
    const data: any = await res.json();
    return {raw:data.choices?.[0]?.message?.content || '',engine:`OpenAI (${model})`};
  });
  requireValue(engines.length,'API key provider AI belum dikonfigurasi di Cloudflare Secrets',503);
  for (const run of engines) {
    try {
      const {raw,engine} = await run();
      const result = JSON.parse(raw.replace(/```(?:json)?/g,'').trim());
      requireValue(!result.error && typeof result.amount==='number' && Number.isSafeInteger(result.amount) && result.amount>0 && result.amount<=1e12,'Struk tidak terbaca');
      const date = new Date(result.date);
      return {merchant:text(result.merchant,'Toko',200),amount:result.amount,date:Number.isNaN(date.getTime())?new Date().toISOString():date.toISOString(),
        category:text(result.category || 'Belanja','Kategori',80),notes:text(result.notes,'Catatan',2000,false),aiEngine:engine,
        items:Array.isArray(result.items)?result.items.slice(0,200).filter((i:any)=>typeof i.name==='string' && Number.isSafeInteger(i.qty) && i.qty>0 && Number.isSafeInteger(i.price) && i.price>=0).map((i:any)=>({name:i.name.slice(0,200),qty:i.qty,price:i.price})):[]};
    } catch { console.warn('Receipt provider failed; no fabricated fallback returned'); }
  }
  throw new HttpError(502,'Gagal membaca struk. Periksa gambar, API key, model, atau kuota AI lalu coba lagi.');
}
