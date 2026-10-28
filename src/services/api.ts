import type { AppSettings, Transaction, User, Wallet } from '../types';

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
async function request<T>(url: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(url,{method,credentials:'same-origin',headers:{'Content-Type':'application/json','X-Uangku-Request':'1'},body:body===undefined?undefined:JSON.stringify(body)});
  const data: any = await response.json().catch(()=>{ throw new ApiError('Respons server tidak valid. Periksa deployment Functions.',response.status); });
  if (!response.ok || data.success===false) throw new ApiError(data.message || 'Permintaan gagal',response.status);
  return data;
}
type AuthResult = {success:boolean;user:User;message?:string};
type WalletResult = {success:boolean;wallet:Wallet;wallets:Wallet[]};
type TxResult = {success:boolean;transaction:Transaction;wallets:Wallet[]};
export interface AdminOverview {
  success: boolean;
  stats: {totalUsers:number;activeUsersToday:number;totalWallets:number;totalTransactions:number;totalSystemBalance:number};
  users: Array<User & {createdAt:string;lastActiveAt:string;walletsCount:number;transactionsCount:number;totalBalance:number}>;
  globalAiSettings: {aiProvider:'auto'|'gemini'|'chatgpt';hasGeminiKey:boolean;hasOpenAiKey:boolean};
}
export const api = {
  register:(name:string,email:string,password:string)=>request<AuthResult>('/api/auth/register','POST',{name,email,password}),
  login:(identifier:string,password?:string)=>request<AuthResult>('/api/auth/login','POST',{email:identifier,password}),
  loginAdmin:(email:string,password:string)=>request<AuthResult>('/api/auth/admin-login','POST',{email,password}),
  loginGoogle:(credential:string)=>request<AuthResult>('/api/auth/google','POST',{credential}),
  getConfig:()=>request<{success:boolean;googleClientId:string}>('/api/config'),
  getMe:()=>request<AuthResult>('/api/auth/me'),
  logout:()=>request<{success:boolean}>('/api/auth/logout','POST',{}),
  updateProfile:(name:string,email:string)=>request<AuthResult>('/api/auth/profile','PUT',{name,email}),
  getWallets:()=>request<{success:boolean;wallets:Wallet[]}>('/api/wallets'),
  createWallet:(wallet:Omit<Wallet,'id'>)=>request<WalletResult>('/api/wallets','POST',wallet),
  updateWallet:(id:string,updates:Partial<Wallet>)=>request<WalletResult>(`/api/wallets/${encodeURIComponent(id)}`,'PUT',updates),
  deleteWallet:(id:string)=>request<WalletResult>(`/api/wallets/${encodeURIComponent(id)}`,'DELETE'),
  async getTransactions(params?:{type?:string;walletId?:string;search?:string}) {
    const transactions:Transaction[]=[];let offset:number|null=0;
    while(offset!==null) {
      const page:{transactions:Transaction[];nextOffset:number|null}=await request(`/api/transactions?${new URLSearchParams({...params,offset:String(offset)})}`);
      transactions.push(...page.transactions);offset=page.nextOffset;
    }
    return {success:true,transactions};
  },
  createTransaction:(tx:Omit<Transaction,'id'|'createdAt'>)=>request<TxResult>('/api/transactions','POST',tx),
  deleteTransaction:(id:string)=>request<TxResult>(`/api/transactions/${encodeURIComponent(id)}`,'DELETE'),
  scanReceipt:(params:{imageBase64:string;receiptType:'pengeluaran'|'pemasukan'})=>request<{success:boolean;data:Omit<Transaction,'id'|'createdAt'|'walletId'|'type'> & {aiEngine:string}}>('/api/scan-receipt','POST',params),
  getSettings:()=>request<{success:boolean;settings:AppSettings}>('/api/settings'),
  updateSettings:(settings:Partial<AppSettings>)=>request<{success:boolean;settings:AppSettings}>('/api/settings','POST',settings),
  getAdminOverview:()=>request<AdminOverview>('/api/admin/overview'),
  resetUserPassword:(userId:string,newPassword:string)=>request<{success:boolean;message:string}>('/api/admin/reset-password','POST',{userId,newPassword}),
  saveAdminAiSettings:(settings:{aiProvider:string})=>request<{success:boolean;message:string}>('/api/admin/ai-settings','POST',settings),
  deleteAdminUser:(id:string)=>request<{success:boolean;message:string}>(`/api/admin/users/${encodeURIComponent(id)}`,'DELETE'),
  async downloadCsv(params:{startDate?:string;endDate?:string}={}) {
    const response = await fetch(`/api/export/report?${new URLSearchParams({format:'csv',...params})}`,{credentials:'same-origin'});
    if (!response.ok) { const data: any = await response.json(); throw new ApiError(data.message || 'Unduhan gagal',response.status); }
    return response.blob();
  },
};
