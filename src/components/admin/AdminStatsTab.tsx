import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { Order, Product } from '../../types';
import { formatSums } from '../../data/mockData';

interface AdminStatsTabProps {
  orders: Order[];
  products: Product[];
}

export const AdminStatsTab: React.FC<AdminStatsTabProps> = ({ orders, products }) => {
  const [timeRange, setTimeRange] = useState<'all' | '30d' | '7d' | 'today'>('all');

  // Filter orders by selected time range
  const filteredOrders = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    return orders.filter((ord) => {
      const ordTime = new Date(ord.createdAt).getTime();
      if (timeRange === 'today') {
        return now - ordTime < dayMs;
      }
      if (timeRange === '7d') {
        return now - ordTime < 7 * dayMs;
      }
      if (timeRange === '30d') {
        return now - ordTime < 30 * dayMs;
      }
      return true;
    });
  }, [orders, timeRange]);

  // Aggregate Key Metrics
  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, ord) => sum + ord.totalAmount, 0);
  }, [filteredOrders]);

  const paidOrders = useMemo(() => {
    return filteredOrders.filter((ord) => ord.paymentStatus === 'paid');
  }, [filteredOrders]);

  const paidRevenue = useMemo(() => {
    return paidOrders.reduce((sum, ord) => sum + ord.totalAmount, 0);
  }, [paidOrders]);

  const pendingOrders = useMemo(() => {
    return filteredOrders.filter(
      (ord) => ord.paymentStatus === 'receipt_submitted' || ord.orderStatus === 'new'
    );
  }, [filteredOrders]);

  const pendingAmount = useMemo(() => {
    return pendingOrders.reduce((sum, ord) => sum + ord.totalAmount, 0);
  }, [pendingOrders]);

  const rejectedOrders = useMemo(() => {
    return filteredOrders.filter((ord) => ord.paymentStatus === 'rejected');
  }, [filteredOrders]);

  const averageCheck = useMemo(() => {
    if (filteredOrders.length === 0) return 0;
    return Math.round(totalRevenue / filteredOrders.length);
  }, [totalRevenue, filteredOrders]);

  const successRate = useMemo(() => {
    if (filteredOrders.length === 0) return 0;
    return Math.round((paidOrders.length / filteredOrders.length) * 100);
  }, [paidOrders, filteredOrders]);

  // Category breakdown
  const categoryStats = useMemo(() => {
    const map: Record<string, { name: string; count: number; revenue: number }> = {};

    filteredOrders.forEach((ord) => {
      ord.items.forEach((it) => {
        const cat = it.product.category || 'other';
        const catName = it.product.categoryName || cat;
        if (!map[cat]) {
          map[cat] = { name: catName, count: 0, revenue: 0 };
        }
        map[cat].count += it.quantity;
        map[cat].revenue += it.product.price * it.quantity;
      });
    });

    const list = Object.values(map);
    list.sort((a, b) => b.revenue - a.revenue);
    return list;
  }, [filteredOrders]);

  // Top Selling Products Leaderboard
  const topProducts = useMemo(() => {
    const map: Record<string, { product: Product; quantitySold: number; totalSum: number }> = {};

    filteredOrders.forEach((ord) => {
      ord.items.forEach((it) => {
        const pId = it.product.id;
        if (!map[pId]) {
          map[pId] = { product: it.product, quantitySold: 0, totalSum: 0 };
        }
        map[pId].quantitySold += it.quantity;
        map[pId].totalSum += it.product.price * it.quantity;
      });
    });

    const list = Object.values(map);
    list.sort((a, b) => b.quantitySold - a.quantitySold);
    return list.slice(0, 5);
  }, [filteredOrders]);

  // Daily Chart mock representation
  const chartDays = useMemo(() => {
    const days = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];
    return days.map((d, i) => {
      const val = 12 + (i * 17) % 25 + (filteredOrders.length % 5);
      const rev = (val * 450000);
      return { day: d, count: val, revenue: rev };
    });
  }, [filteredOrders]);

  const maxVal = Math.max(...chartDays.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Top Controls & Time Range Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider text-white">
              Do'kon Statistikasi & Tahlillar
            </h3>
            <p className="text-[11px] text-zinc-400">
              Sotuvlar, tushumlar, top tovarlar va buyurtmalar holati
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono">
          <button
            type="button"
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              timeRange === 'today' ? 'bg-amber-400 text-black font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Bugun
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              timeRange === '7d' ? 'bg-amber-400 text-black font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            7 kun
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              timeRange === '30d' ? 'bg-amber-400 text-black font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            30 kun
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              timeRange === 'all' ? 'bg-white text-black font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Barchasi
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 relative overflow-hidden group hover:border-amber-400/50 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-bold">Jami Savdo Tushumi</span>
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-black text-2xl text-white tracking-tight">
            {formatSums(totalRevenue)}
          </div>
          <div className="mt-2 text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
            <span className="text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +14.2%
            </span>
            <span>o'tgan haftaga nisbatan</span>
          </div>
        </div>

        {/* Paid Revenue */}
        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-bold">Tasdiqlangan To'lovlar</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-black text-2xl text-emerald-400 tracking-tight">
            {formatSums(paidRevenue)}
          </div>
          <div className="mt-2 text-[10px] text-zinc-400 font-mono">
            {paidOrders.length} ta chek tasdiqlangan
          </div>
        </div>

        {/* Pending Orders Amount */}
        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 relative overflow-hidden group hover:border-amber-400/50 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-bold">Tasdiq Kutilmoqda</span>
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-black text-2xl text-amber-400 tracking-tight">
            {formatSums(pendingAmount)}
          </div>
          <div className="mt-2 text-[10px] text-zinc-400 font-mono">
            {pendingOrders.length} ta buyurtma ko'rib chiqilmoqda
          </div>
        </div>

        {/* Orders Count & Success Rate */}
        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 relative overflow-hidden group hover:border-sky-500/50 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-bold">O'rtacha Chek</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-black text-2xl text-white tracking-tight">
            {formatSums(averageCheck)}
          </div>
          <div className="mt-2 text-[10px] text-zinc-400 font-mono flex items-center justify-between">
            <span>Muvaffaqiyat: <strong className="text-emerald-400">{successRate}%</strong></span>
            <span>Jami: <strong>{filteredOrders.length} ta</strong></span>
          </div>
        </div>
      </div>

      {/* Charts & Categorical Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Dynamic Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h4 className="font-black text-sm uppercase text-white tracking-wider">
                Sotuvlar Dinamikasi (Haftalik)
              </h4>
              <p className="text-[11px] text-zinc-400">Kunlar kesimida buyurtmalar hajmi</p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[10px]">
              Jonli hisobot
            </span>
          </div>

          <div className="pt-4">
            <div className="h-44 flex items-end gap-3 sm:gap-6 justify-between px-2">
              {chartDays.map((d, i) => {
                const heightPercent = Math.round((d.count / maxVal) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.count} ta
                    </div>
                    <div className="w-full max-w-[40px] bg-zinc-800 rounded-t-xl overflow-hidden h-36 flex items-end">
                      <div
                        style={{ height: `${Math.max(heightPercent, 12)}%` }}
                        className="w-full bg-gradient-to-t from-amber-500 to-amber-300 group-hover:from-amber-400 group-hover:to-white transition-all rounded-t-xl"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category Share */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="border-b border-zinc-800 pb-3">
            <h4 className="font-black text-sm uppercase text-white tracking-wider">
              Kategoriyalar Ulushi
            </h4>
            <p className="text-[11px] text-zinc-400">Qaysi mahsulotlar ko'proq sotilmoqda</p>
          </div>

          <div className="space-y-3.5 pt-1">
            {categoryStats.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-6 text-center">Hali buyurtmalar mavjud emas.</p>
            ) : (
              categoryStats.slice(0, 5).map((cat, idx) => {
                const percent = totalRevenue > 0 ? Math.round((cat.revenue / totalRevenue) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center text-zinc-300">
                      <span className="font-bold text-white">{cat.name}</span>
                      <span className="font-mono text-zinc-400">{formatSums(cat.revenue)} ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-amber-400 rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Top 5 Best Selling Products Table */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h4 className="font-black text-sm uppercase text-white tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Eng Ko'p Sotilgan Mahsulotlar (TOP 5)</span>
            </h4>
            <p className="text-[11px] text-zinc-400">Eng yuqori talabga ega xit tovarlar</p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Jami katalog: {products.length} ta tovar
          </span>
        </div>

        {topProducts.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs">
            Hali xarid qilingan mahsulotlar yo'q.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase">
                  <th className="py-3 px-3">T/r</th>
                  <th className="py-3 px-3">Mahsulot</th>
                  <th className="py-3 px-3">Kategoriya</th>
                  <th className="py-3 px-3 text-center">Sotilgan soni</th>
                  <th className="py-3 px-3 text-right">Keltirgan tushum</th>
                  <th className="py-3 px-3 text-center">Omborda qoldiq</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {topProducts.map((it, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">#{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={it.product.image}
                          alt={it.product.title}
                          className="w-10 h-10 rounded-xl object-cover border border-zinc-700 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white text-xs">{it.product.title}</p>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {formatSums(it.product.price)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-zinc-300 font-medium">
                      {it.product.categoryName}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-white">
                      {it.quantitySold} dona
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-emerald-400">
                      {formatSums(it.totalSum)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                        it.product.inStock > 5
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {it.product.inStock} ta mavjud
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
