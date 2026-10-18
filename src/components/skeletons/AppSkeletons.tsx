import React from 'react';

export const ShimmerBar: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-slate-200/85 animate-pulse rounded-xl ${className}`} />
);

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="w-full pb-28 md:pb-12 text-slate-800 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Balance Card Skeleton */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-blue-900 p-6 text-white shadow-xl shadow-indigo-600/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-3 w-28 bg-white/20 rounded-md animate-pulse" />
                <div className="h-4 w-4 bg-white/20 rounded-full animate-pulse" />
              </div>

              {/* Big Nominal */}
              <div className="h-10 w-48 bg-white/25 rounded-xl animate-pulse mt-2" />

              {/* Income & Expense Mini Cards */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/15">
                <div className="bg-white/10 rounded-2xl p-3 space-y-2">
                  <div className="h-2.5 w-16 bg-white/20 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-white/30 rounded animate-pulse" />
                </div>
                <div className="bg-white/10 rounded-2xl p-3 space-y-2">
                  <div className="h-2.5 w-16 bg-white/20 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-white/30 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-18 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 p-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-200 animate-pulse" />
                  <div className="h-2 w-12 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Wallets Summary Skeleton */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-200 animate-pulse" />
                    <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions List Skeleton */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-36 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-3 w-14 bg-slate-100 rounded animate-pulse" />
            </div>

            <div className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="py-3.5 flex items-center justify-between gap-3 first:pt-1 last:pb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 animate-pulse shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-32 bg-slate-200 rounded animate-pulse" />
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-16 bg-slate-100 rounded animate-pulse" />
                        <div className="h-2.5 w-12 bg-slate-100 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1.5">
                    <div className="h-3.5 w-20 bg-slate-200 rounded animate-pulse ml-auto" />
                    <div className="h-2.5 w-14 bg-slate-100 rounded animate-pulse ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TransactionListSkeleton: React.FC = () => {
  return (
    <div className="w-full pb-28 md:pb-12 text-slate-800 animate-in fade-in duration-300 space-y-5">
      {/* Search & Filter Header Skeleton */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        {/* Search Input Bar */}
        <div className="h-11 w-full bg-slate-100 rounded-2xl animate-pulse" />

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-hidden pt-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-24 bg-slate-100 rounded-xl animate-pulse shrink-0" />
          ))}
        </div>
      </div>

      {/* Transaction Groups Skeleton */}
      <div className="space-y-4">
        {[1, 2].map((group) => (
          <div key={group} className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-3">
            {/* Date Group Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="h-3.5 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
            </div>

            {/* Transaction Items */}
            <div className="divide-y divide-slate-100">
              {[1, 2, 3].map((item) => (
                <div key={item} className="py-3 flex items-center justify-between gap-3 first:pt-1 last:pb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 animate-pulse shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-36 bg-slate-200 rounded animate-pulse" />
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-20 bg-slate-100 rounded animate-pulse" />
                        <div className="h-2.5 w-14 bg-slate-100 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1.5">
                    <div className="h-4 w-24 bg-slate-200 rounded animate-pulse ml-auto" />
                    <div className="h-2.5 w-16 bg-slate-100 rounded animate-pulse ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
