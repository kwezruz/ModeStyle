import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Check } from 'lucide-react';
import { CartItem, PromoCode } from '../types';
import { formatSums } from '../data/mockData';
import { cleanText } from '../utils/cleanText';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, size: string, delta: number, color?: string) => void;
  onRemoveItem: (productId: string, size: string, color?: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  promoCodes: PromoCode[];
  appliedPromo: PromoCode | null;
  onApplyPromo: (promo: PromoCode | null) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  promoCodes,
  appliedPromo,
  onApplyPromo,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * appliedPromo.discountValue) / 100);
    } else {
      discountAmount = appliedPromo.discountValue;
    }
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    const match = promoCodes.find((p) => p.code.toUpperCase() === code && p.active);
    if (!match) {
      setPromoError('Bunday promokod mavjud emas');
      return;
    }
    if (subtotal < match.minOrderAmount) {
      setPromoError(`Minimal xarid: ${formatSums(match.minOrderAmount)}`);
      return;
    }
    onApplyPromo(match);
    setPromoInput('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between relative overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-black text-white shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <h3 className="font-mono font-bold text-sm tracking-wide">
              XARID SAVATI ({cartItems.reduce((s, i) => s + i.quantity, 0)})
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

        {/* Drawer Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-zinc-50/50">
          {cartItems.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-sm text-black">Savatingiz bo'sh</h4>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Katalogdan o'zingizga yoqqan kiyim yoki krossovkalarni tanlang.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item, idx) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColor || ''}-${idx}`}
                  className="p-3 rounded-2xl bg-white border border-zinc-200 flex items-center gap-3"
                >
                  <img
                    src={item.selectedColorImage || item.product.image}
                    alt={cleanText(item.product.title)}
                    className="w-16 h-16 object-contain rounded-xl bg-zinc-50 border border-zinc-100 p-1 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-black truncate">
                      {cleanText(item.product.title)}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded bg-black text-white text-[10px] font-mono font-bold">
                        {item.selectedSize}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-mono text-xs font-bold text-black">
                        {formatSums(item.product.price * item.quantity)}
                      </span>
                      <div className="flex items-center border border-zinc-200 rounded-lg bg-zinc-50">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, -1, item.selectedColor)}
                          className="p-1 hover:bg-zinc-200 rounded-l-lg text-zinc-600 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-black">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, 1, item.selectedColor)}
                          className="p-1 hover:bg-zinc-200 rounded-r-lg text-zinc-600 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.product.id, item.selectedSize, item.selectedColor)}
                    className="p-1.5 text-zinc-400 hover:text-black transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-[11px] text-zinc-400 hover:text-black transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Savatni tozalash
                </button>
              </div>

              {/* Promo Code Input */}
              <div className="p-3.5 rounded-2xl bg-white border border-zinc-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black flex items-center gap-1.5 font-mono">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Promokod:</span>
                  </label>
                  {appliedPromo && (
                    <button
                      type="button"
                      onClick={() => onApplyPromo(null)}
                      className="text-[11px] text-zinc-500 hover:text-black hover:underline cursor-pointer"
                    >
                      Bekor qilish
                    </button>
                  )}
                </div>
                {appliedPromo ? (
                  <div className="p-2.5 rounded-xl bg-zinc-100 border border-zinc-300 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-black">
                      <Check className="w-3.5 h-3.5" />
                      <span>{appliedPromo.code} faollashtirildi (-{formatSums(discountAmount)})</span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePromoSubmit} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        setPromoError('');
                      }}
                      placeholder="MODESTYLE10"
                      className="flex-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-black text-xs font-mono uppercase tracking-wider outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!promoInput.trim()}
                      className="px-3.5 py-2 rounded-xl bg-black hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      Qo'llash
                    </button>
                  </form>
                )}
                {promoError && (
                  <p className="text-[11px] text-rose-600 font-medium">{promoError}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-zinc-200 bg-white space-y-3 shrink-0">
            <div className="space-y-1.5 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Mahsulotlar:</span>
                <span className="font-mono font-semibold text-black">{formatSums(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-black font-bold">
                  <span>Chegirma:</span>
                  <span className="font-mono">-{formatSums(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 border-t border-zinc-100 font-bold text-black">
                <span>Jami to'lov:</span>
                <span className="font-mono text-base font-black text-black">
                  {formatSums(finalTotal)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full py-3.5 px-4 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Buyurtmani rasmiylashtirish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
