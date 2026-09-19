import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  ShoppingBag,
  Award,
  Download,
  Calendar,
} from 'lucide-react';
import { Order } from '../../types';
import { formatSums } from '../../data/mockData';

interface AdminCustomersTabProps {
  orders: Order[];
}

interface CustomerSummary {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  tier: 'VIP' | 'Doimiy' | 'Yangi';
}

export const AdminCustomersTab: React.FC<AdminCustomersTabProps> = ({ orders }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'VIP' | 'Doimiy' | 'Yangi'>('all');

  // Aggregate unique customers
  const customers = useMemo(() => {
    const map: Record<string, CustomerSummary> = {};

    orders.forEach((ord) => {
      // Normalize key by phone or email
      const key = (ord.phone || ord.email || ord.customerName).trim().toLowerCase();
      if (!key) return;

      if (!map[key]) {
        map[key] = {
          id: key,
          name: ord.customerName || 'Mijoz',
          phone: ord.phone || '',
          email: ord.email || '',
          city: ord.city || 'Toshkent',
          address: ord.address || '',
          ordersCount: 0,
          totalSpent: 0,
          lastOrderDate: ord.createdAt,
          tier: 'Yangi',
        };
      }

      map[key].ordersCount += 1;
      map[key].totalSpent += ord.totalAmount;
      if (new Date(ord.createdAt).getTime() > new Date(map[key].lastOrderDate).getTime()) {
        map[key].lastOrderDate = ord.createdAt;
      }
    });

    const list = Object.values(map).map((c) => {
      let tier: 'VIP' | 'Doimiy' | 'Yangi' = 'Yangi';
      if (c.totalSpent >= 2000000 || c.ordersCount >= 4) {
        tier = 'VIP';
      } else if (c.ordersCount >= 2) {
        tier = 'Doimiy';
      }
      return { ...c, tier };
    });

    // Sort by total spent descending
    list.sort((a, b) => b.totalSpent - a.totalSpent);
    return list;
  }, [orders]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (tierFilter !== 'all' && c.tier !== tierFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = c.name.toLowerCase().includes(q);
        const matchPhone = c.phone.toLowerCase().includes(q);
        const matchEmail = (c.email || '').toLowerCase().includes(q);
        const matchCity = c.city.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchEmail && !matchCity) return false;
      }
      return true;
    });
  }, [customers, searchQuery, tierFilter]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Ism', 'Telefon', 'Email', 'Shahar', 'Manzil', 'Buyurtmalar soni', 'Jami sarflangan summa', 'Oxirgi sana', 'Maqom'];
    const rows = filteredCustomers.map((c) => [
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email || ''}"`,
      `"${c.city}"`,
      `"${c.address}"`,
      c.ordersCount,
      c.totalSpent,
      `"${new Date(c.lastOrderDate).toLocaleDateString()}"`,
      `"${c.tier}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `modestyle_mijozlar_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header with Search and Export */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider text-white">
              Mijozlar Ro'yxati ({customers.length} nafar)
            </h3>
            <p className="text-[11px] text-zinc-400">
              Barcha doimiy xaridorlar, kontaktlar va xaridlar tarixi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors border border-zinc-700"
          >
            <Download className="w-4 h-4" />
            <span>Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Mijoz ismi, telefoni, shahri bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono">
          <button
            type="button"
            onClick={() => setTierFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              tierFilter === 'all' ? 'bg-white text-black font-bold' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            Barchasi ({customers.length})
          </button>
          <button
            type="button"
            onClick={() => setTierFilter('VIP')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              tierFilter === 'VIP' ? 'bg-amber-400 text-black font-bold' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            VIP ({customers.filter((c) => c.tier === 'VIP').length})
          </button>
          <button
            type="button"
            onClick={() => setTierFilter('Doimiy')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              tierFilter === 'Doimiy' ? 'bg-emerald-500 text-white font-bold' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            Doimiy ({customers.filter((c) => c.tier === 'Doimiy').length})
          </button>
          <button
            type="button"
            onClick={() => setTierFilter('Yangi')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              tierFilter === 'Yangi' ? 'bg-sky-500 text-white font-bold' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            Yangi ({customers.filter((c) => c.tier === 'Yangi').length})
          </button>
        </div>
      </div>

      {/* Customers List Table */}
      {filteredCustomers.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 text-xs bg-zinc-900/50 rounded-3xl border border-zinc-800">
          Mijoz topilmadi.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top Row: Name & Tier Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">{c.name}</h4>
                    <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{c.city}</span>
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                      c.tier === 'VIP'
                        ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                        : c.tier === 'Doimiy'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {c.tier}
                  </span>
                </div>

                {/* Info block */}
                <div className="p-3 rounded-2xl bg-black border border-zinc-800 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>Buyurtmalar soni:</span>
                    <strong className="text-white">{c.ordersCount} ta</strong>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Jami xarid:</span>
                    <strong className="text-emerald-400">{formatSums(c.totalSpent)}</strong>
                  </div>
                  <div className="flex justify-between text-zinc-400 text-[10px] pt-1 border-t border-zinc-800">
                    <span>Oxirgi buyurtma:</span>
                    <span className="text-zinc-300">
                      {new Date(c.lastOrderDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {c.address && (
                  <p className="text-[11px] text-zinc-400 truncate">
                    Manzil: {c.address}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                {c.phone ? (
                  <a
                    href={`tel:${c.phone}`}
                    className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Qo'ng'iroq</span>
                  </a>
                ) : null}

                {c.phone && (
                  <a
                    href={`https://t.me/+${c.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-sky-600 text-sky-400 hover:text-white transition-colors"
                    title="Telegram orqali yozish"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}

                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                    title="Email yozish"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
