import React, { useEffect, useState } from 'react';
import { api, type AdminOverview } from '../../services/api';
import { formatRupiah } from '../../utils/finance';

export function AdminScreen({onBack}:{onBack:()=>void}) {
  const [data,setData]=useState<AdminOverview|null>(null); const [error,setError]=useState('');
  const [busy,setBusy]=useState(false); const [provider,setProvider]=useState('auto');
  const load=async()=>{ setBusy(true);setError('');try { const res=await api.getAdminOverview();setData(res);setProvider(res.globalAiSettings.aiProvider); }
    catch(e){setError(e instanceof Error?e.message:'Gagal memuat admin');}finally{setBusy(false);} };
  useEffect(()=>{void load();},[]);
  const action=async(fn:()=>Promise<unknown>)=>{setBusy(true);setError('');try{await fn();await load();}catch(e){setError(e instanceof Error?e.message:'Gagal menyimpan');}finally{setBusy(false);}};
  return <div className="min-h-screen bg-slate-950 text-white p-5 space-y-6">
    <header className="flex gap-4 items-center"><button onClick={onBack}>← Kembali</button><h1 className="font-bold text-xl">Admin UANGKU</h1><button disabled={busy} onClick={load}>Segarkan</button></header>
    {error && <p role="alert" className="p-4 bg-red-950 rounded-xl">{error}</p>}
    {busy && <p>Memproses…</p>}
    {data && <>
      <section className="grid sm:grid-cols-3 gap-3">{Object.entries(data.stats).map(([key,value])=><div key={key} className="bg-slate-800 p-4 rounded-xl"><p>{key}</p><strong>{key==='totalSystemBalance'?formatRupiah(value):value}</strong></div>)}</section>
      <section className="bg-slate-800 p-4 rounded-xl space-y-3"><h2 className="font-bold">Konfigurasi AI</h2>
        <p>Gemini: {data.globalAiSettings.hasGeminiKey?'Key terpasang':'Belum diatur'} · OpenAI: {data.globalAiSettings.hasOpenAiKey?'Key terpasang':'Belum diatur'}</p>
        <p className="text-sm">Key rahasia hanya diatur di Cloudflare → Settings → Variables and Secrets. Status ini tidak menguji kuota/key.</p>
        <select aria-label="Provider AI" value={provider} onChange={e=>setProvider(e.target.value)} className="bg-slate-900 p-2 rounded"><option value="auto">Otomatis</option><option value="gemini">Gemini</option><option value="chatgpt">OpenAI</option></select>
        <button disabled={busy} onClick={()=>action(()=>api.saveAdminAiSettings({aiProvider:provider}))} className="ml-3 bg-indigo-600 p-2 rounded">Simpan provider global</button>
      </section>
      <div className="overflow-auto"><table className="w-full text-left text-sm"><thead><tr><th>Pengguna</th><th>Role</th><th>Dompet</th><th>Transaksi</th><th>Saldo</th><th>Aksi</th></tr></thead><tbody>
        {data.users.map(u=><tr key={u.id} className="border-t border-slate-700"><td className="p-3">{u.name}<br/>{u.email}</td><td>{u.role}</td><td>{u.walletsCount}</td><td>{u.transactionsCount}</td><td>{formatRupiah(u.totalBalance)}</td><td className="space-x-3">
          <button disabled={busy} onClick={()=>{const pass=prompt(`Kata sandi baru ${u.email} (10–128 karakter). Semua sesi akan dicabut.`);if(pass)void action(()=>api.resetUserPassword(u.id,pass));}}>Reset sandi</button>
          <button disabled={busy} className="text-red-300" onClick={()=>{if(confirm(`Hapus permanen akun ${u.email} beserta semua datanya?`))void action(()=>api.deleteAdminUser(u.id));}}>Hapus</button>
        </td></tr>)}
      </tbody></table></div>
      <p className="text-xs text-slate-400">Maksimal 1.000 akun ditampilkan. Password, token sesi, dan API key tidak pernah ditampilkan.</p>
    </>}
  </div>;
}
