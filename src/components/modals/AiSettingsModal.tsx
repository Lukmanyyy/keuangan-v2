import React, { useState } from 'react';
import type { AppSettings } from '../../types';

export function AiSettingsModal({isOpen,onClose,settings,onSave}:{isOpen:boolean;onClose:()=>void;settings:AppSettings;onSave:(settings:Partial<AppSettings>)=>void|Promise<void>}) {
  const [provider,setProvider]=useState(settings.aiProvider); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  if(!isOpen)return null;
  return <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><form className="bg-white text-slate-800 p-6 rounded-2xl max-w-sm space-y-4" onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{await onSave({aiProvider:provider});onClose();}catch(e){setError(e instanceof Error?e.message:'Gagal menyimpan');}finally{setBusy(false);}}}>
    <h2 className="font-bold">AI Scan Struk</h2><p className="text-sm">API key disimpan oleh pemilik di Cloudflare Secrets, bukan di browser. Kuota dan biaya mengikuti provider.</p>
    <p className="text-xs">Gemini: {settings.hasGeminiKey?'Key terpasang':'Belum diatur'} · OpenAI: {settings.hasOpenAiKey?'Key terpasang':'Belum diatur'}</p>
    <select aria-label="Provider AI" className="border rounded p-2 w-full" value={provider} onChange={e=>setProvider(e.target.value as AppSettings['aiProvider'])}><option value="auto">Otomatis (Gemini → OpenAI)</option><option value="gemini">Gemini</option><option value="chatgpt">OpenAI</option></select>
    <p className="text-xs">Preferensi global admin, jika diatur, menggantikan pilihan pengguna.</p>
    {error&&<p role="alert" className="text-red-600">{error}</p>}
    <button disabled={busy} type="submit" className="bg-indigo-600 text-white p-3 rounded-xl mr-3">Simpan</button><button type="button" onClick={onClose}>Tutup</button>
  </form></div>;
}
