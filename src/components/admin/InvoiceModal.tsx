import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { Order } from '../../types';
import { formatSums, STORE_PHONE } from '../../data/mockData';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div
        className="bg-white text-black w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="px-6 py-4 bg-zinc-950 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-amber-400 text-sm">
              INVOYS: {order.orderNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Chop etish (Print)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Paper */}
        <div className="p-8 overflow-y-auto space-y-6 text-xs bg-white font-sans print:p-0">
          {/* Brand Header */}
          <div className="flex justify-between items-start border-b border-zinc-200 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-black text-sm">
                  M
                </span>
                <span className="font-black text-lg tracking-wider uppercase">MODESTYLE UZ</span>
              </div>
              <p className="text-zinc-500 text-[11px]">Premium Streetwear & Sneakers</p>
              <p className="text-zinc-500 text-[11px]">Toshkent, O'zbekiston &middot; Tel: {STORE_PHONE}</p>
            </div>
            <div className="text-right font-mono">
              <span className="text-zinc-400 text-[10px] block uppercase">Buyurtma hujjati:</span>
              <span className="font-black text-sm text-black block">{order.orderNumber}</span>
              <span className="text-[11px] text-zinc-500 block">
                {new Date(order.createdAt).toLocaleDateString('uz-UZ', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span
                className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  order.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {order.paymentStatus === 'paid' ? "To'langan" : "To'lov kutilmoqda"}
              </span>
            </div>
          </div>

          {/* Customer & Delivery Details */}
          <div className="grid grid-cols-2 gap-6 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
            <div>
              <span className="text-zinc-400 uppercase font-mono text-[10px] block mb-1">Xaridor:</span>
              <p className="font-bold text-sm text-black">{order.customerName}</p>
              <p className="text-zinc-600 font-mono mt-0.5">{order.phone}</p>
              {order.email && <p className="text-zinc-600 font-mono text-[11px]">{order.email}</p>}
            </div>
            <div>
              <span className="text-zinc-400 uppercase font-mono text-[10px] block mb-1">Yetkazib berish manzili:</span>
              <p className="font-bold text-zinc-800">{order.city}</p>
              <p className="text-zinc-600">{order.address}</p>
              {order.notes && (
                <p className="text-zinc-500 italic mt-1 text-[11px]">Izoh: {order.notes}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-zinc-200 text-zinc-400 font-mono text-[10px] uppercase">
                  <th className="py-2">T/r</th>
                  <th className="py-2">Mahsulot nomi</th>
                  <th className="py-2">Razmer</th>
                  <th className="py-2">Rangi</th>
                  <th className="py-2 text-center">Soni</th>
                  <th className="py-2 text-right">Narxi</th>
                  <th className="py-2 text-right">Jami</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {order.items.map((it, idx) => (
                  <tr key={idx} className="text-zinc-800">
                    <td className="py-2.5 font-mono text-zinc-400">{idx + 1}</td>
                    <td className="py-2.5 font-medium">{it.product.title}</td>
                    <td className="py-2.5 font-mono font-bold text-black">{it.selectedSize}</td>
                    <td className="py-2.5 text-zinc-500">{it.selectedColor || "Standart"}</td>
                    <td className="py-2.5 text-center font-mono">{it.quantity}</td>
                    <td className="py-2.5 text-right font-mono text-zinc-600">
                      {formatSums(it.product.price)}
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-black">
                      {formatSums(it.product.price * it.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-4 border-t border-zinc-200">
            <div className="w-64 space-y-1.5 text-right">
              {order.promoCode && (
                <div className="flex justify-between text-zinc-500">
                  <span>Promokod ({order.promoCode}):</span>
                  <span className="font-mono text-emerald-600">Chegirma qo'llandi</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-500">
                <span>Yetkazib berish:</span>
                <span className="font-mono font-bold text-emerald-600">BEPUL</span>
              </div>
              <div className="flex justify-between text-sm font-black border-t border-zinc-300 pt-2 text-black">
                <span>Jami to'lov:</span>
                <span className="font-mono text-base text-black">{formatSums(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-6 border-t border-dashed border-zinc-200 text-center text-[10px] text-zinc-400">
            <p>Modestyle Uzbekistan &middot; Har bir xarid uchun tashakkur bildiramiz!</p>
            <p className="mt-0.5">Xarid qilingan tovarlarni 14 kun ichida almashtirish kafolatlangan.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
