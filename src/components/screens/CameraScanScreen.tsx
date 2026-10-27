import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';
import type { TransactionItem } from '../../types';

interface Props {
  receiptType:'pengeluaran'|'pemasukan';
  onClose:()=>void;
  onScanComplete:(data:{merchant:string;amount:number;date:string;category:string;items?:TransactionItem[];notes?:string;aiEngine?:string;imageDataUrl?:string})=>void;
}
export function CameraScanScreen({receiptType,onClose,onScanComplete}:Props) {
  const video=useRef<HTMLVideoElement>(null); const stream=useRef<MediaStream|null>(null);
  const [facing,setFacing]=useState<'environment'|'user'>('environment');
  const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const [preview,setPreview]=useState('');
  useEffect(()=>{
    let disposed=false;
    navigator.mediaDevices?.getUserMedia({video:{facingMode:{ideal:facing},width:{ideal:1600}},audio:false})
      .then(s=>{if(disposed){s.getTracks().forEach(t=>t.stop());return;}stream.current=s;if(video.current){video.current.srcObject=s;void video.current.play().catch(()=>{});}})
      .catch(()=>{if(!disposed)setError('Kamera tidak tersedia. Izinkan kamera atau pilih foto dari galeri.');});
    return ()=>{disposed=true;stream.current?.getTracks().forEach(t=>t.stop());};
  },[facing]);
  const scan=async(data:string)=>{
    if(busy)return;setBusy(true);setError('');setPreview(data);
    try {const result=await api.scanReceipt({receiptType,imageBase64:data});onScanComplete({...result.data,imageDataUrl:data});}
    catch(e){setError(e instanceof Error?e.message:'Pemindaian gagal');}
    finally{setBusy(false);}
  };
  const capture=()=>{
    const v=video.current;if(!v?.videoWidth){setError('Kamera belum siap. Pilih foto dari galeri.');return;}
    const canvas=document.createElement('canvas');const scale=Math.min(1,1800/Math.max(v.videoWidth,v.videoHeight));
    canvas.width=Math.round(v.videoWidth*scale);canvas.height=Math.round(v.videoHeight*scale);
    canvas.getContext('2d')!.drawImage(v,0,0,canvas.width,canvas.height);void scan(canvas.toDataURL('image/jpeg',0.85));
  };
  const upload=async(file?:File)=>{
    if(!file)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15_000_000){setError('Pilih JPEG/PNG/WebP maksimal 15 MB.');return;}
    const objectUrl=URL.createObjectURL(file);
    try {
      const img=new Image();img.src=objectUrl;await img.decode();
      const canvas=document.createElement('canvas');const scale=Math.min(1,1800/Math.max(img.width,img.height));
      canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);
      canvas.getContext('2d')!.drawImage(img,0,0,canvas.width,canvas.height);await scan(canvas.toDataURL('image/jpeg',0.85));
    }catch{setError('Gambar tidak dapat dibuka.');}finally{URL.revokeObjectURL(objectUrl);}
  };
  return <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col items-center p-4 gap-4 overflow-auto">
    <header className="w-full max-w-xl flex justify-between"><button onClick={onClose}>✕ Tutup</button><h1 className="font-bold">Pindai struk</h1><button disabled={busy} onClick={()=>{setPreview('');setFacing(f=>f==='environment'?'user':'environment');}}>Ganti kamera</button></header>
    <div className="relative w-full max-w-xl bg-black rounded-2xl overflow-hidden"><video ref={video} autoPlay playsInline muted className="w-full max-h-[60vh] object-contain"/>{preview&&<img src={preview} alt="Foto struk" className="absolute inset-0 w-full h-full object-contain bg-black"/>}</div>
    {error&&<p role="alert" className="max-w-xl bg-red-950 p-4 rounded-xl">{error}</p>}
    <p className="text-sm text-slate-300">Foto dikirim ke provider AI untuk dibaca. Periksa hasil sebelum menyimpan.</p>
    <div className="flex gap-4 flex-wrap justify-center"><button disabled={busy} onClick={()=>{if(preview)setPreview('');else capture();}} className="bg-indigo-600 p-4 rounded-xl">{busy?'Memindai…':preview?'Foto ulang':'Ambil foto & pindai'}</button>
      {preview&&<button disabled={busy} onClick={()=>scan(preview)} className="p-4 rounded-xl border">Coba pindai lagi</button>}
      <label className="p-4 rounded-xl border cursor-pointer">Pilih foto<input disabled={busy} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e=>{void upload(e.target.files?.[0]);e.target.value='';}}/></label>
    </div>
  </div>;
}
