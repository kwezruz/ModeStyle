import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  CreditCard,
  Banknote,
  Copy,
  Check,
  UploadCloud,
  ArrowRight,
  AlertCircle,
  Clock,
  Receipt,
  ShoppingBag,
  LogIn,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { CartItem, Order, PaymentMethod, PromoCode, PaymentCardConfig } from '../types';
import { formatSums, CITIES_LIST } from '../data/mockData';
import { cleanText } from '../utils/cleanText';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  promo: PromoCode | null;
  onOrderCreated: (order: Order) => void;
  currentUser: User | null;
  onLoginGoogle: () => void;
  paymentCard: PaymentCardConfig;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  promo,
  onOrderCreated,
  currentUser,
  onLoginGoogle,
  paymentCard,
}) => {
  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('+998 ');
  const [city, setCity] = useState(CITIES_LIST[0]);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptName, setReceiptName] = useState('');
  const [sendReceiptViaTelegramLater, setSendReceiptViaTelegramLater] = useState(false);
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.displayName && !customerName) {
        setCustomerName(currentUser.displayName);
      }
      if (currentUser.email && !email) {
        setEmail(currentUser.email);
      }
    }
  }, [currentUser]);

  if (!isOpen || items.length === 0) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  let discountAmount = 0;
  if (promo) {
    if (promo.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * promo.discountValue) / 100);
    } else {
      discountAmount = promo.discountValue;
    }
  }

  const totalAmount = Math.max(0, subtotal - discountAmount);

  const handleCopyCard = () => {
    navigator.clipboard.writeText(paymentCard.cardNumber.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg("Iltimos, faqat rasm formatidagi to'lov chekini yuklang!");
      return;
    }
    setReceiptName(file.name);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // High quality client-side canvas compression (<250KB for instant Telegram delivery)
        const canvas = document.createElement('canvas');
        const maxDimension = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setReceiptImage(compressed);
        } else {
          setReceiptImage(reader.result as string);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMsg('Iltimos, ismingizni to\'liq kiriting!');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      setErrorMsg('Iltimos, telefon raqamingizni to\'liq kiriting!');
      return;
    }
    if (!address.trim() || address.trim().length < 3) {
      setErrorMsg('Iltimos, yetkazib berish manzilini kiriting!');
      return;
    }
    if (paymentMethod === 'card' && !receiptImage && !sendReceiptViaTelegramLater) {
      setErrorMsg('Iltimos, to\'lov cheki rasmini yuklang yoki "Chekni Telegram orqali yuboraman" bandini tanlang!');
      return;
    }

    setIsSubmitting(true);
    const orderNumber = `MS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: currentUser?.uid,
      customerName: customerName.trim(),
      email: email.trim() || currentUser?.email || undefined,
      phone: phone.trim(),
      city,
      address: address.trim(),
      deliveryMethod: 'courier',
      subtotal,
      discountAmount,
      totalAmount,
      paymentMethod,
      paymentStatus: receiptImage ? 'receipt_submitted' : 'cash_on_delivery',
      receiptImage: receiptImage || undefined,
      receiptUploadedAt: receiptImage ? new Date().toISOString() : undefined,
      orderStatus: 'new',
      items,
      createdAt: new Date().toISOString(),
      notes: notes.trim()
        ? sendReceiptViaTelegramLater
          ? `${notes.trim()} (Mijoz to'lov chekini Telegram orqali yuboradi)`
          : notes.trim()
        : sendReceiptViaTelegramLater
        ? "Mijoz to'lov chekini Telegram orqali yuboradi"
        : undefined,
      promoCode: promo?.code,
    };

    setTimeout(() => {
      onOrderCreated(newOrder);
      setCompletedOrder(newOrder);
      setIsSubmitting(false);
    }, 600);
  };

  if (completedOrder) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white w-full max-w-lg rounded-3xl border border-zinc-200 p-6 sm:p-8 text-center space-y-4 shadow-2xl my-auto">
          <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="font-black text-xl text-black">
              Buyurtmangiz qabul qilindi!
            </h3>
            <p className="text-xs text-zinc-600 max-w-sm mx-auto">
              Buyurtma raqamingiz: <strong className="font-mono text-black">{completedOrder.orderNumber}</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-left space-y-2 text-xs">
            <div className="flex justify-between font-bold text-black border-b border-zinc-200 pb-2">
              <span>Xaridor:</span>
              <span>{completedOrder.customerName}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Telefon:</span>
              <span className="font-mono">{completedOrder.phone}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Manzil:</span>
              <span>{completedOrder.city}, {completedOrder.address}</span>
            </div>
            <div className="flex justify-between font-bold text-black pt-2 border-t border-zinc-200">
              <span>To'lov summasi:</span>
              <span className="font-mono text-sm">{formatSums(completedOrder.totalAmount)}</span>
            </div>
          </div>

          {/* Telegram status notice */}
          <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 text-xs flex items-center justify-between gap-2 text-left">
            <div>
              <span className="font-bold block">
                {completedOrder.receiptImage
                  ? "✅ To'lov cheki va buyurtma Telegramga yuborildi!"
                  : "📲 Buyurtma tafsilotlari Telegramga uzatildi!"}
              </span>
              <span className="text-[11px] text-sky-800">
                Operatorimiz buyurtmangizni tez orada ko'rib chiqadi.
              </span>
            </div>
            <a
              href="https://t.me/Modestyleuzbot"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] shrink-0 inline-flex items-center gap-1"
            >
              <span>Botga o'tish</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Xaridni davom ettirish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-2xl my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-black text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-black text-base sm:text-lg tracking-wide">
              Buyurtma rasmiylashtirish
            </h2>
            <p className="text-[11px] text-zinc-400">
              modestyle rasmiy do'koni
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Optional Google login prompt if guest */}
          {!currentUser && (
            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="text-zinc-600">
                  Google akkauntingiz bilan kirsangiz, buyurtmalar avtomatik saqlanadi.
                </span>
              </div>
              <button
                type="button"
                onClick={onLoginGoogle}
                className="px-3 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 text-xs font-bold cursor-pointer shrink-0"
              >
                Kirish
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-zinc-100 border border-black text-black text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Customer info */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
              1. Xaridor ma'lumotlari
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-black">Ism va familiyangiz:</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Sardor Rahimov"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-black text-xs font-medium outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-black">Telefon raqamingiz:</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-black text-xs font-mono outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-black">Shahar / Viloyat:</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-black text-xs font-medium outline-none"
                >
                  {CITIES_LIST.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-black">Yetkazib berish manzili:</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ko'cha nomi, uy va xonadon"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-black text-xs font-medium outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-black">Izoh yoki kuryerga eslatma:</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Masalan: Kechki soat 18:00 dan keyin yetkazilsin..."
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-black text-xs font-medium outline-none"
              />
            </div>
          </div>

          {/* Order items review */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-black border-b border-zinc-200 pb-2">
              <span className="flex items-center gap-1.5 font-mono">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Buyurtma tarkibi ({items.reduce((s, i) => s + i.quantity, 0)} ta):</span>
              </span>
              <span className="font-mono">{formatSums(totalAmount)}</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-zinc-700">
                  <span className="truncate pr-2">
                    {cleanText(it.product.title)} ({it.selectedSize}) x {it.quantity}
                  </span>
                  <span className="font-mono font-bold text-black shrink-0">
                    {formatSums(it.product.price * it.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment options */}
          <div className="space-y-3 pt-2">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
              2. To'lov usuli
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-2.5 ${
                  paymentMethod === 'card'
                    ? 'border-black bg-zinc-50'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-bold text-xs text-black flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Karta orqali to'lov (Chek bilan)</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Humo yoki Uzcard kartasiga pul o'tkazib, chek skrinshotini yuklaysiz.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-2.5 ${
                  paymentMethod === 'cash'
                    ? 'border-black bg-zinc-50'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-bold text-xs text-black flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Qabul qilganda to'lash</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Buyurtmani kuryerdan tekshirib qabul qilgach to'laysiz.
                  </p>
                </div>
              </label>
            </div>

            {/* If card payment is selected */}
            {paymentMethod === 'card' && (
              <div className="p-4 rounded-2xl bg-black text-white space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="text-xs font-mono font-bold text-zinc-300">
                    {paymentCard.bankName}
                  </div>
                  <span className="font-mono text-xs font-bold text-white">
                    {formatSums(totalAmount)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[9px] uppercase font-mono text-zinc-400 block">Karta raqami:</span>
                    <span className="font-mono font-black text-sm sm:text-base text-white tracking-wider block">
                      {paymentCard.cardNumber}
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      {paymentCard.cardHolder}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopyCard}
                      className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Nusxalandi!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Nusxa olish</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Payment Apps links */}
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono">Tezkor to'lov:</span>
                  <button
                    type="button"
                    onClick={() => {
                      handleCopyCard();
                      window.open('https://payme.uz', '_blank');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-300 text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    Payme
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleCopyCard();
                      window.open('https://click.uz', '_blank');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-700/50 text-sky-300 text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    Click
                  </button>
                </div>

                {paymentCard.instructions && (
                  <p className="text-[11px] text-zinc-400 italic leading-relaxed">
                    {paymentCard.instructions}
                  </p>
                )}

                {/* Upload Receipt */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5" />
                      <span>To'lov cheki (Skrinshot):</span>
                    </label>
                    <span className="text-[10px] text-zinc-400">
                      {receiptImage ? "Chek biriktirildi" : "Ixtiyoriy / Majburiy"}
                    </span>
                  </div>

                  {!receiptImage ? (
                    <label className="border-2 border-dashed border-zinc-700 hover:border-white rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-zinc-900/50 group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <UploadCloud className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors mb-1" />
                      <span className="text-xs font-bold text-white">Chek rasmini yuklash uchun bosing</span>
                      <span className="text-[10px] text-zinc-400">Payme, Click yoki bank ilovasi skrinshoti</span>
                    </label>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={receiptImage}
                          alt="Chek"
                          className="w-12 h-12 rounded-lg object-cover bg-black border border-zinc-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white truncate block max-w-[180px]">
                            {receiptName || "To'lov cheki"}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Telegramga yuborishga tayyor</span>
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setReceiptImage(null);
                          setReceiptName('');
                        }}
                        className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 rounded cursor-pointer"
                      >
                        O'chirish
                      </button>
                    </div>
                  )}

                  {/* Alternative: send receipt via Telegram later */}
                  <label className="flex items-start gap-2 pt-1 cursor-pointer text-xs text-zinc-400 hover:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={sendReceiptViaTelegramLater}
                      onChange={(e) => {
                        setSendReceiptViaTelegramLater(e.target.checked);
                        if (e.target.checked) setErrorMsg('');
                      }}
                      className="mt-0.5 accent-white rounded"
                    />
                    <span>
                      To'lov qildim, chekni keyinroq Telegram bot (@Modestyleuzbot) orqali yuboraman
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-black hover:bg-zinc-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Yuborilmoqda...</span>
                </>
              ) : (
                <>
                  <span>Buyurtmani tasdiqlash ({formatSums(totalAmount)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
