import React, { useState } from 'react';
import type { User, ScreenId, AppSettings } from '../../types';
import { saveBlob } from '../../services/reports';

interface Props {
  user:User;settings?:AppSettings;onSaveSettings?:(settings:Partial<AppSettings>)=>void|Promise<void>;
  onNavigate:(screen:ScreenId)=>void;onOpenAiSettings:()=>void;
  onUpdateUser:(name:string,email:string)=>void|Promise<void>;
  onResetDemoData:()=>void;onLogout:()=>void;
}
export function ProfileSettingsScreen({user,settings,onSaveSettings,onNavigate,onOpenAiSettings,onUpdateUser,onLogout}:Props) {
  const [name,setName]=useState(user.name);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  const run=async(fn:()=>void|Promise<void>)=>{setBusy(true);setError('');try{await fn();}catch(e){setError(e instanceof Error?e.message:'Gagal menyimpan');}finally{setBusy(false);}};
  return <div className="max-w-3xl mx-auto pb-28 space-y-5"><h1 className="text-2xl font-bold">Profil & Pengaturan</h1>
    {error&&<p role="alert" className="text-red-600">{error}</p>}
    <form onSubmit={e=>{e.preventDefault();void run(()=>onUpdateUser(name,user.email));}} className="bg-white p-5 border rounded-2xl space-y-3">
      <label className="block">Nama<input className="block border rounded p-2 w-full" maxLength={80} required value={name} onChange={e=>setName(e.target.value)}/></label>
      <p>Email: {user.email}</p><p className="text-xs text-slate-500">Email tidak dapat diubah tanpa verifikasi ulang.</p>
      <button disabled={busy} className="bg-indigo-600 text-white p-3 rounded-xl">Simpan nama</button>
    </form>
    <section className="bg-white p-5 border rounded-2xl space-y-3"><h2 className="font-bold">Penyimpanan cloud</h2><p>Dompet, transaksi, kategori, dan pengaturan disimpan per akun di Cloudflare D1.</p>
      <p>Arsip foto struk: {settings?.hasReceiptStorage?'R2 terpasang':'Tidak aktif; hanya hasil transaksi yang disimpan'}.</p>
      <p className="text-xs">Foto struk hanya dapat dibuka oleh akun pemiliknya. Aktifkan R2 jika ingin menyimpan foto asli yang dipindai.</p>
      <button disabled={busy} onClick={()=>run(async()=>{const response=await fetch('/api/export/report',{credentials:'same-origin'});const data:any=await response.json();if(!response.ok)throw new Error(data.message || 'Ekspor gagal');saveBlob(new Blob([JSON.stringify(data.report,null,2)],{type:'application/json'}),'backup-keuangan-uangku.json');})} className="border p-3 rounded-xl">Unduh data transaksi (JSON)</button>
    </section>
    <section className="bg-white p-5 border rounded-2xl space-y-3"><h2 className="font-bold">AI & preferensi</h2>
      <p>Gemini: {settings?.hasGeminiKey?'Key terpasang':'Belum dikonfigurasi'} · OpenAI: {settings?.hasOpenAiKey?'Key terpasang':'Belum dikonfigurasi'}</p>
      <p className="text-xs">API key hanya disimpan di Cloudflare Secrets. Biaya dan kuota mengikuti provider; foto dikirim ke provider saat dipindai.</p>
      <button onClick={onOpenAiSettings} className="border p-3 rounded-xl">Pilih provider AI</button>
      <label className="block"><input disabled={busy} type="checkbox" checked={settings?.notifications ?? true} onChange={e=>run(()=>onSaveSettings?.({notifications:e.target.checked}))}/> Simpan preferensi notifikasi (pengiriman push belum tersedia)</label>
    </section>
    <nav className="flex flex-wrap gap-4"><button onClick={()=>onNavigate('privacy')}>Privasi</button><button onClick={()=>onNavigate('terms')}>Ketentuan</button>{user.role==='admin'&&<button onClick={()=>onNavigate('admin')}>Panel admin</button>}<button onClick={onLogout} className="text-red-600">Keluar</button></nav>
  </div>;
}
