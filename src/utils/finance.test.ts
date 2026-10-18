import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRupiah,
  parseRupiah,
  calculateTotalKas,
  calculateTransactionSummary,
  calculateCategoryStats,
  parseIndonesianReceiptText,
  type Wallet,
  type Transaction,
} from './finance.ts';

test('formatRupiah formats Indonesian currency correctly', () => {
  assert.equal(formatRupiah(10182000), 'Rp 10.182.000');
  assert.equal(formatRupiah(45000), 'Rp 45.000');
  assert.equal(formatRupiah(0), 'Rp 0');
  assert.equal(formatRupiah(1500000, false), '1.500.000');
});

test('parseRupiah cleans and parses numbers correctly', () => {
  assert.equal(parseRupiah('Rp 45.000'), 45000);
  assert.equal(parseRupiah('10.182.000'), 10182000);
  assert.equal(parseRupiah('Rp. 2.500.000'), 2500000);
  assert.equal(parseRupiah(''), 0);
});

test('calculateTotalKas sums wallet balances', () => {
  const wallets: Wallet[] = [
    { id: '1', name: 'Kas Utama', balance: 4250000, color: 'blue', icon: 'wallet' },
    { id: '2', name: 'Dana Darurat', balance: 2500000, color: 'emerald', icon: 'shield' },
    { id: '3', name: 'Tabungan', balance: 2000000, color: 'purple', icon: 'piggy' },
    { id: '4', name: 'Kas Bisnis', balance: 1432000, color: 'sky', icon: 'briefcase' },
  ];
  assert.equal(calculateTotalKas(wallets), 10182000);
});

test('calculateTransactionSummary calculates income and expense correctly', () => {
  const transactions: Transaction[] = [
    {
      id: 't1',
      type: 'pemasukan',
      walletId: '1',
      merchant: 'Gaji Bulanan',
      amount: 8500000,
      date: '2024-05-14T08:00:00Z',
      category: 'Gaji & Penghasilan',
      createdAt: '2024-05-14T08:00:00Z',
    },
    {
      id: 't2',
      type: 'pengeluaran',
      walletId: '1',
      merchant: 'Kopi Kenangan',
      amount: 45000,
      date: '2024-05-14T12:30:00Z',
      category: 'Makan & Minum',
      createdAt: '2024-05-14T12:30:00Z',
    },
    {
      id: 't3',
      type: 'pengeluaran',
      walletId: '1',
      merchant: 'Belanja Groceries',
      amount: 150000,
      date: '2024-05-13T12:30:00Z',
      category: 'Belanja',
      createdAt: '2024-05-13T12:30:00Z',
    },
  ];

  const summary = calculateTransactionSummary(transactions);
  assert.equal(summary.income, 8500000);
  assert.equal(summary.expense, 195000);
  assert.equal(summary.net, 8500000 - 195000);
});

test('calculateCategoryStats computes correct breakdown percentages', () => {
  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'pengeluaran',
      walletId: 'w1',
      merchant: 'Cafe',
      amount: 40000,
      date: '2024-05-14',
      category: 'Makan & Minum',
      createdAt: '2024-05-14',
    },
    {
      id: '2',
      type: 'pengeluaran',
      walletId: 'w1',
      merchant: 'Mart',
      amount: 60000,
      date: '2024-05-14',
      category: 'Belanja',
      createdAt: '2024-05-14',
    },
  ];

  const stats = calculateCategoryStats(transactions, 'pengeluaran');
  assert.equal(stats.length, 2);
  // Belanja is 60%, Makan is 40%
  assert.equal(stats[0].category, 'Belanja');
  assert.equal(stats[0].percentage, 60);
  assert.equal(stats[1].category, 'Makan & Minum');
  assert.equal(stats[1].percentage, 40);
});

test('parseIndonesianReceiptText detects Kopi Kenangan and total', () => {
  const receipt = `
    Kopi Kenangan
    Jl. Sudirman No. 123
    Americano 1 25.000
    Roti Croissant 1 20.000
    Subtotal 45.000
    Total Rp 45.000
  `;
  const parsed = parseIndonesianReceiptText(receipt);
  assert.equal(parsed.merchant, 'Kopi Kenangan');
  assert.equal(parsed.total, 45000);
  assert.equal(parsed.category, 'Makan & Minum');
});
