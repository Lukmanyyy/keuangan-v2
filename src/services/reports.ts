import type { Transaction, Wallet } from '../types';
import { csvCell } from '../../cloudflare/security';

export function saveBlob(blob:Blob,name:string) {
  const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
export async function downloadReport(format:'csv'|'pdf'|'xlsx',transactions:Transaction[],wallets:Wallet[]) {
  const columns=['Tanggal','Jenis','Keterangan','Kategori','Kas','Nominal (Rp)','Catatan'];
  const rows=transactions.map(t=>[new Date(t.date).toLocaleDateString('id-ID'),t.type,t.merchant,t.category,wallets.find(w=>w.id===t.walletId)?.name || '',t.amount,t.notes || '']);
  if(format==='csv') {
    saveBlob(new Blob(['\uFEFF'+[columns,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),'laporan-uangku.csv');
  } else if(format==='xlsx') {
    const {default:writeXlsxFile}=await import('write-excel-file/browser');
    await writeXlsxFile([columns.map(value=>({value,fontWeight:'bold' as const})),...rows.map(row=>row.map(value=>({value,type:typeof value==='number'?Number:String})))],{columns:columns.map(()=>({width:24}))}).toFile('laporan-uangku.xlsx');
  } else {
    const {jsPDF}=await import('jspdf');const doc=new jsPDF({orientation:'landscape'});
    doc.setFontSize(16);doc.text('Laporan Keuangan UANGKU',14,16);doc.setFontSize(9);
    let y=26;
    for(const row of [columns,...rows]) {
      const line=doc.splitTextToSize(row.join(' | '),265);
      const height=line.length*5;
      if(y+height>195){doc.addPage();y=16;}
      doc.text(line,14,y);y+=height+3;
    }
    doc.save('laporan-uangku.pdf');
  }
}
