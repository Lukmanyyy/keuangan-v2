import React, { useEffect, useId, useRef, useState } from 'react';
import { api } from '../../services/api';
import type { User } from '../../types';
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from '../../../shared/auth';

export function AdminLoginModal({onClose,onSuccess}:{onClose:()=>void;onSuccess:(user:User)=>void|Promise<void>}) {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  const submitting = useRef(false);
  const titleId = useId();
  const emailId = useId();
  const passwordId = useId();
  useEffect(()=>{
    const handleKey = (event:KeyboardEvent)=>{if(event.key==='Escape' && !submitting.current) onClose();};
    window.addEventListener('keydown',handleKey);
    return ()=>window.removeEventListener('keydown',handleKey);
  },[onClose]);
  const submit = async (event:React.FormEvent)=>{
    event.preventDefault();
    if(submitting.current)return;
    submitting.current=true;setBusy(true);setError('');
    try {
      const result = await api.loginAdmin(email.trim(),password);
      if(result.user.role!=='admin')throw new Error('Akun ini bukan administrator.');
      setPassword('');
      await onSuccess(result.user);
    }catch(error){setError(error instanceof Error?error.message:'Login admin gagal.');}
    finally{submitting.current=false;setBusy(false);}
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
    <section role="dialog" aria-modal="true" aria-labelledby={titleId} className="w-full max-w-sm bg-white text-slate-800 rounded-2xl p-6 space-y-4">
      <div className="flex justify-between items-center"><h2 id={titleId} className="font-bold text-lg">Masuk administrator</h2><button type="button" aria-label="Tutup login admin" disabled={busy} onClick={onClose}>✕</button></div>
      <p className="text-sm text-slate-500">Gunakan ADMIN_EMAIL dan ADMIN_PASSWORD milik pemilik website, atau akun yang sudah diberi role admin.</p>
      <form onSubmit={submit} className="space-y-4">
        <div><label htmlFor={emailId} className="block text-sm mb-1">Email admin</label><input id={emailId} type="email" autoComplete="username" autoFocus required maxLength={254} disabled={busy} value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded-xl p-3"/></div>
        <div><label htmlFor={passwordId} className="block text-sm mb-1">Password admin</label><input id={passwordId} type="password" autoComplete="current-password" required minLength={MIN_PASSWORD_LENGTH} maxLength={MAX_PASSWORD_LENGTH} placeholder={`Minimal ${MIN_PASSWORD_LENGTH} karakter`} disabled={busy} value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded-xl p-3"/></div>
        {error&&<p role="alert" className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold">{busy?'Memeriksa…':'Masuk panel admin'}</button>
      </form>
    </section>
  </div>;
}
