import React from 'react';
import { X, LogOut, Package, Mail, User as UserIcon, MapPin, Phone, ShieldCheck, Shield, Crown } from 'lucide-react';
import { User } from 'firebase/auth';
import { Order } from '../types';
import { formatSums } from '../data/mockData';
import { isUserAdmin } from '../firebase';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogout: () => void;
  orders: Order[];
  onGoToAdmin?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  orders,
  onGoToAdmin,
}) => {
  if (!isOpen || !currentUser) return null;

  const isAdmin = isUserAdmin(currentUser);

  // Normal users ONLY see their own orders!
  const userOrders = orders.filter(
    (o) =>
      (o.userId && o.userId === currentUser.uid) ||
      (o.email && currentUser.email && o.email.toLowerCase() === currentUser.email.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-2xl my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-black text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-white" />
            <h3 className="font-bold text-sm tracking-wide">
              {isAdmin ? "Admin Profili" : "Mijoz Profili"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* User badge card */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center gap-4">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || ''}
                className="w-16 h-16 rounded-2xl object-cover border border-zinc-300 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-black text-white font-black text-xl flex items-center justify-center shrink-0">
                {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-black text-base text-black truncate">
                  {currentUser.displayName || (isAdmin ? "Do'kon Egasi" : "Hurmatli Mijoz")}
                </h4>
              </div>
              <p className="text-xs text-zinc-500 font-mono truncate">{currentUser.email}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {isAdmin ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-black text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1 border border-amber-400/40">
                    <Crown className="w-3 h-3 text-amber-400" />
                    Do'kon Egasi (Admin)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-zinc-200 text-zinc-800 text-[10px] font-mono font-bold flex items-center gap-1">
                    <UserIcon className="w-3 h-3" />
                    Mijoz hisobi
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Google Tasdiqlangan
                </span>
              </div>
            </div>
          </div>

          {/* If Admin: Direct Access to Admin Portal */}
          {isAdmin && onGoToAdmin && (
            <div className="p-4 rounded-2xl bg-zinc-900 text-white border border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold">Admin Boshqaruv Portali</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400">Egasi</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Siz do'kon egasi sifatida buyurtmalarni tekshirish, mahsulot qo'shish, to'lov cheklarini ko'rish va Telegram sozlamalarini boshqara olasiz.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToAdmin();
                }}
                className="w-full py-2.5 rounded-xl bg-amber-400 text-black hover:bg-amber-300 text-xs font-black transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Shield className="w-4 h-4 text-black" />
                <span>Admin Portaliga O'tish</span>
              </button>
            </div>
          )}

          {/* User Orders History */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                <Package className="w-4 h-4" />
                <span>Sizning buyurtmalaringiz ({userOrders.length})</span>
              </h4>
              <span className="text-[10px] text-zinc-400 font-mono">
                Faqat ushbu hisob xaridlari
              </span>
            </div>

            {userOrders.length === 0 ? (
              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-1">
                <p className="text-xs text-zinc-600 font-medium">Hozircha buyurtma berilmagan.</p>
                <p className="text-[11px] text-zinc-400">
                  Ushbu hisob bilan berilgan buyurtmalar va to'lov cheklari faqat sizga ko'rinadi.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {userOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-black">{ord.orderNumber || ord.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          ord.paymentStatus === 'paid'
                            ? 'bg-black text-white'
                            : ord.paymentStatus === 'receipt_submitted'
                            ? 'bg-zinc-200 text-zinc-800'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {ord.paymentStatus === 'paid'
                          ? "To'langan"
                          : ord.paymentStatus === 'receipt_submitted'
                          ? 'Chek tekshirilmoqda'
                          : 'Kutilmoqda'}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {new Date(ord.createdAt).toLocaleDateString()} • {ord.items.length} ta tovar
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-200 font-bold text-black">
                      <span>Jami:</span>
                      <span className="font-mono">{formatSums(ord.totalAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Tizimdan chiqish</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 text-xs font-bold cursor-pointer transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
