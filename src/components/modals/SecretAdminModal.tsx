import React, { useState } from 'react';
import { api } from '../../services/api';

export function SecretAdminModal({isOpen,onClose,onSuccess}:{isOpen:boolean;onClose:()=>void;onSuccess:()=>void}) {
  const [error,setError] = useState(''); const [loading,setLoading] = useState(false);
  if (!isOpen) return null;
  const verify = async()=>{
    setLoading(true); setError('');
    try { const res=await api.getMe(); if (res.user.role!=='admin') throw new Error('Akun ini bukan administrator.'); onSuccess(); onClose(); }
    catch (e) { setError(e instanceof Error?e.message:'Login sebagai admin terlebih dahulu.'); }
    finally { setLoading(false); }
  };
  return <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><div className="bg-white text-slate-800 rounded-2xl p-6 max-w-sm space-y-4">
    <h2 className="font-bold">Panel administrator</h2>
    <p className="text-sm">Login terlebih dahulu melalui menu Masuk dengan ADMIN_EMAIL dan ADMIN_PASSWORD yang diatur pemilik di Cloudflare, atau akun yang sudah memiliki role admin. Tidak ada PIN bawaan.</p>
    {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}
    <button onClick={verify} disabled={loading} className="bg-indigo-600 text-white p-3 rounded-xl mr-3">{loading?'Memeriksa…':'Buka panel'}</button>
    <button onClick={onClose}>Kembali</button>
  </div></div>;
}
