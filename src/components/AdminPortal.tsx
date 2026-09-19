import React, { useState } from 'react';
import {
  Lock,
  ShoppingBag,
  Package,
  CheckCircle2,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Check,
  CreditCard,
  Image as ImageIcon,
  Tag,
  Save,
  AlertCircle,
  ExternalLink,
  Edit2,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  MessageSquare,
  Send,
  Palette,
  Ruler,
  UserCheck,
  Bot,
  RefreshCw,
  Store,
  Shield,
  ShieldCheck,
  LogOut,
  Sliders,
  DollarSign,
  ArrowLeft,
  X,
  Layers,
  Users,
  Search,
  Printer,
  Download,
  MapPin,
  Navigation,
  Phone,
  Map,
  Smartphone,
  SendHorizontal,
} from 'lucide-react';
import {
  Order,
  Product,
  PromoCode,
  BannerSlide,
  PaymentCardConfig,
  ChatMessage,
  ProductColor,
  OperatorConfig,
  SizeRuleConfig,
  ChatTemplate,
  TelegramBotConfig,
  TelegramCustomerProfile,
} from '../types';
import { formatSums, CATEGORIES } from '../data/mockData';
import { cleanText } from '../utils/cleanText';
import { isUserAdmin } from '../firebase';
import { User } from 'firebase/auth';
import {
  sendTelegramMessage,
  getTelegramRecentChats,
  getStoredTelegramCustomers,
  clearStoredTelegramCustomers,
  saveStoredTelegramCustomer,
  addCustomerMessage,
} from '../services/telegramService';
import { AdminStatsTab } from './admin/AdminStatsTab';
import { AdminCustomersTab } from './admin/AdminCustomersTab';
import { AdminOperatorSizeTab } from './admin/AdminOperatorSizeTab';
import { InvoiceModal } from './admin/InvoiceModal';

interface AdminPortalProps {
  orders: Order[];
  onUpdateOrder: (order: Order) => void;
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  banners: BannerSlide[];
  onUpdateBanners: (banners: BannerSlide[]) => void;
  paymentCard: PaymentCardConfig;
  onUpdatePaymentCard: (card: PaymentCardConfig) => void;
  promoCodes: PromoCode[];
  onUpdatePromoCodes: (promos: PromoCode[]) => void;
  chatMessages: ChatMessage[];
  onSendAdminMessage: (text: string) => void;
  onClearChat?: () => void;
  operatorConfig?: OperatorConfig;
  onUpdateOperatorConfig?: (config: OperatorConfig) => void;
  telegramConfig?: TelegramBotConfig;
  onUpdateTelegramConfig?: (config: TelegramBotConfig) => void;
  currentUser: User | null;
  onLoginGoogle: () => Promise<void>;
  onLogout: () => Promise<void>;
  onBackToStore: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  orders,
  onUpdateOrder,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  banners,
  onUpdateBanners,
  paymentCard,
  onUpdatePaymentCard,
  promoCodes,
  onUpdatePromoCodes,
  chatMessages,
  onSendAdminMessage,
  onClearChat,
  operatorConfig,
  onUpdateOperatorConfig,
  telegramConfig,
  onUpdateTelegramConfig,
  currentUser,
  onLoginGoogle,
  onLogout,
  onBackToStore,
}) => {
  // If currentUser is verified admin (davroncaiman09@gmail.com), allow direct access!
  const isOwner = currentUser && isUserAdmin(currentUser);

  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Authenticated if owner email or unlocked via PIN
  const isAuthenticated = Boolean(isOwner || pinUnlocked);

  type TabType =
    | 'stats'
    | 'orders'
    | 'customers'
    | 'operator'
    | 'chat'
    | 'products'
    | 'banners'
    | 'card'
    | 'promos'
    | 'telegram';
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Chat admin reply state
  const [adminReplyText, setAdminReplyText] = useState('');

  // Card form state
  const [cardForm, setCardForm] = useState<PaymentCardConfig>(paymentCard);
  const [cardSavedSuccess, setCardSavedSuccess] = useState(false);

  // Banner editing
  const [bannerList, setBannerList] = useState<BannerSlide[]>(banners);
  const [bannerSavedSuccess, setBannerSavedSuccess] = useState(false);

  // Promo code form state
  const [promoList, setPromoList] = useState<PromoCode[]>(promoCodes);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoValue, setNewPromoValue] = useState('10');
  const [newPromoType, setNewPromoType] = useState<'percentage' | 'fixed'>('percentage');
  const [newPromoMin, setNewPromoMin] = useState('200000');
  const [newPromoDesc, setNewPromoDesc] = useState('');

  // Add product form state
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newBrand, setNewBrand] = useState('modestyle');
  const [newCategory, setNewCategory] = useState('sneakers');
  const [newPrice, setNewPrice] = useState('990000');
  const [newOldPrice, setNewOldPrice] = useState('1200000');
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80');
  const [newDescription, setNewDescription] = useState('Premium sifatli mahsulot.');

  // Sizes state
  const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const SHOE_SIZES = ['38', '39', '40', '41', '42', '43', '44', '45'];
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M', 'L', 'XL']);
  const [customSizeInput, setCustomSizeInput] = useState('');

  // Colors state
  const COLOR_PRESETS = [
    { name: 'Qora', hex: '#000000' },
    { name: 'Oq', hex: '#ffffff' },
    { name: 'Kulrang', hex: '#9ca3af' },
    { name: 'Qizil', hex: '#dc2626' },
    { name: 'Moviy', hex: '#2563eb' },
    { name: 'Yashil', hex: '#16a34a' },
    { name: 'Bej / Krem', hex: '#f5f5dc' },
    { name: 'Jigarrang', hex: '#78350f' },
  ];

  const [productColors, setProductColors] = useState<ProductColor[]>([
    { name: 'Qora', hex: '#000000', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80' },
  ]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  const [newColorImage, setNewColorImage] = useState('');

  // Operator Jacob & Size Rules editing state
  const [opName, setOpName] = useState(operatorConfig?.name || 'Jacob');
  const [opTitle, setOpTitle] = useState(operatorConfig?.title || "Rasmiy do'kon operatori");
  const [opAvatar, setOpAvatar] = useState(operatorConfig?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');
  const [opRules, setOpRules] = useState<SizeRuleConfig[]>(operatorConfig?.sizeRules || []);
  const [opTemplates, setOpTemplates] = useState<ChatTemplate[]>(operatorConfig?.templates || []);
  const [opSavedSuccess, setOpSavedSuccess] = useState(false);

  // New size rule form
  const [newRuleSize, setNewRuleSize] = useState('2XL');
  const [newRuleMinHeight, setNewRuleMinHeight] = useState('170');
  const [newRuleMaxHeight, setNewRuleMaxHeight] = useState('190');
  const [newRuleMinWeight, setNewRuleMinWeight] = useState('77');
  const [newRuleMaxWeight, setNewRuleMaxWeight] = useState('105');
  const [newRuleNote, setNewRuleNote] = useState("170 sm va 77 kg uchun juda qulay oversize razmer.");

  // Telegram Bot & Socials integration state
  const [tgToken, setTgToken] = useState(telegramConfig?.botToken || '8203001916:AAH2yAU_Le2oxSszoS3jqRCP2vhXJw2WaLs');
  const [tgChatId, setTgChatId] = useState(telegramConfig?.chatId || '2002780745');
  const [tgBotUsername, setTgBotUsername] = useState(telegramConfig?.botUsername || 'Modestyleuzbot');
  const [tgEnabled, setTgEnabled] = useState(telegramConfig?.enabled ?? true);
  const [tgNotifyOrders, setTgNotifyOrders] = useState(telegramConfig?.notifyOrders ?? true);
  const [tgNotifyChat, setTgNotifyChat] = useState(telegramConfig?.notifyChat ?? true);
  const [tgChannel, setTgChannel] = useState(telegramConfig?.telegramChannel || 'https://t.me/modestyle_uz');
  const [tgInstagram, setTgInstagram] = useState(telegramConfig?.instagramProfile || 'https://instagram.com/modestyle.uz');
  const [tgAdminUser, setTgAdminUser] = useState(telegramConfig?.adminUsername || '@kwezr');
  const [tgSiteUrl, setTgSiteUrl] = useState(telegramConfig?.storeWebsiteUrl || 'https://modestyle.uz');
  const [tgAdminPin, setTgAdminPin] = useState(telegramConfig?.adminPin || '1234');
  const [tgPromoText, setTgPromoText] = useState(
    telegramConfig?.welcomePromoText ||
      "ModeStyle.uz — Zamonaviy streetwear kiyimlar va brend krossovkalar rasmiy do'koni! 🛍👕👟"
  );
  const [tgSavedSuccess, setTgSavedSuccess] = useState(false);
  const [tgTestLoading, setTgTestLoading] = useState(false);
  const [tgTestResult, setTgTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [tgRecentChats, setTgRecentChats] = useState<Array<{ id: string; name: string; username?: string; type: string }>>([]);
  const [tgLoadingChats, setTgLoadingChats] = useState(false);

  // Telegram customers & locations collected by bot
  const [telegramCustomers, setTelegramCustomers] = useState<TelegramCustomerProfile[]>(() => {
    return getStoredTelegramCustomers();
  });
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [directMsgModal, setDirectMsgModal] = useState<{
    isOpen: boolean;
    customer: TelegramCustomerProfile | null;
    text: string;
    loading: boolean;
    status: { success: boolean; msg: string } | null;
  }>({
    isOpen: false,
    customer: null,
    text: '',
    loading: false,
    status: null,
  });

  React.useEffect(() => {
    const handleUpdate = () => {
      setTelegramCustomers(getStoredTelegramCustomers());
    };
    window.addEventListener('modestyle_telegram_customers_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('modestyle_telegram_customers_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Order filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'new' | 'paid' | 'delivered' | 'rejected'>('all');

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim().toLowerCase();
    if (cleanPin === '7777' || cleanPin === '7788' || cleanPin === 'modestyle') {
      setPinUnlocked(true);
      setPinError(false);
      setCardForm(paymentCard);
      setBannerList(banners);
      setPromoList(promoCodes);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1500);
    }
  };

  const handleOrderReceiptStatus = (order: Order, status: 'paid' | 'rejected') => {
    onUpdateOrder({
      ...order,
      paymentStatus: status,
      orderStatus: status === 'paid' ? 'processing' : order.orderStatus,
    });
  };

  const handleUpdateOrderStatus = (order: Order, nextStatus: Order['orderStatus']) => {
    onUpdateOrder({
      ...order,
      orderStatus: nextStatus,
    });
  };

  // Card save
  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePaymentCard(cardForm);
    setCardSavedSuccess(true);
    setTimeout(() => setCardSavedSuccess(false), 3000);
  };

  // Banner save
  const handleSaveBanners = () => {
    onUpdateBanners(bannerList);
    setBannerSavedSuccess(true);
    setTimeout(() => setBannerSavedSuccess(false), 3000);
  };

  const handleBannerChange = (index: number, field: keyof BannerSlide, val: any) => {
    setBannerList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleAddBanner = () => {
    const newSlide: BannerSlide = {
      id: `banner-${Date.now()}`,
      badge: "YANGI KOLLEKSIYA",
      badgeIcon: 'sparkles',
      title: 'YANGI MAVSUM 2026',
      subtitle: "Eng sara streetwear va original krossovkalar kolleksiyasi.",
      category: 'all',
      btnText: "Barchasini ko'rish",
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&auto=format&fit=crop&q=80',
      active: true,
    };
    setBannerList((prev) => [...prev, newSlide]);
  };

  const handleDeleteBanner = (id: string) => {
    if (bannerList.length <= 1) {
      alert("Kamida 1 ta banner qolishi kerak!");
      return;
    }
    setBannerList((prev) => prev.filter((b) => b.id !== id));
  };

  // Promo code operations
  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;
    const p: PromoCode = {
      id: `promo-${Date.now()}`,
      code: newPromoCode.trim().toUpperCase(),
      discountType: newPromoType,
      discountValue: Number(newPromoValue) || 10,
      minOrderAmount: Number(newPromoMin) || 0,
      description: newPromoDesc.trim() || `${newPromoValue}${newPromoType === 'percentage' ? '%' : " so'm"} chegirma`,
      active: true,
    };
    const updated = [p, ...promoList];
    setPromoList(updated);
    onUpdatePromoCodes(updated);
    setNewPromoCode('');
    setNewPromoDesc('');
  };

  const handleTogglePromo = (id: string) => {
    const updated = promoList.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
    setPromoList(updated);
    onUpdatePromoCodes(updated);
  };

  const handleDeletePromo = (id: string) => {
    const updated = promoList.filter((p) => p.id !== id);
    setPromoList(updated);
    onUpdatePromoCodes(updated);
  };

  // Product quick add with sizes and colors
  const handleToggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleAddCustomSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSizeInput.trim()) return;
    const val = customSizeInput.trim();
    if (!selectedSizes.includes(val)) {
      setSelectedSizes((prev) => [...prev, val]);
    }
    setCustomSizeInput('');
  };

  const handleAddProductColor = () => {
    if (!newColorName.trim()) return;
    setProductColors((prev) => [
      ...prev,
      {
        name: cleanText(newColorName),
        hex: newColorHex,
        image: newColorImage.trim() || newImage.trim(),
      },
    ]);
    setNewColorName('');
    setNewColorImage('');
  };

  const handleRemoveProductColor = (colorName: string) => {
    setProductColors((prev) => prev.filter((c) => c.name !== colorName));
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const catObj = CATEGORIES.find((c) => c.slug === newCategory) || CATEGORIES[1];
    const finalSizes = selectedSizes.length > 0 ? selectedSizes : ['M', 'L', 'XL'];
    const finalColors = productColors.length > 0
      ? productColors
      : [{ name: 'Asosiy', hex: '#000000', image: newImage.trim() }];

    const newProd: Product = {
      id: editingProductId || `prod-${Date.now()}`,
      title: cleanText(newTitle),
      category: newCategory,
      categoryName: catObj.name,
      brand: cleanText(newBrand),
      price: Number(newPrice) || 500000,
      oldPrice: Number(newOldPrice) || undefined,
      image: finalColors[0]?.image || newImage.trim(),
      gallery: [finalColors[0]?.image || newImage.trim()],
      rating: 5.0,
      reviewsCount: 1,
      inStock: 25,
      badges: ['yangi'],
      description: cleanText(newDescription),
      specs: [
        { label: 'Brend', value: cleanText(newBrand) },
        { label: 'Sifat', value: 'Original / Premium' },
        { label: 'Ranglar soni', value: `${finalColors.length} xil rang` },
      ],
      sizes: finalSizes,
      colors: finalColors,
    };

    if (editingProductId && onUpdateProduct) {
      onUpdateProduct(newProd);
    } else {
      onAddProduct(newProd);
    }
    setIsAddingProduct(false);
    setEditingProductId(null);
    setNewTitle('');
  };

  const handleStartEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setNewTitle(prod.title);
    setNewBrand(prod.brand);
    setNewCategory(prod.category);
    setNewPrice(String(prod.price));
    setNewOldPrice(prod.oldPrice ? String(prod.oldPrice) : '');
    setNewImage(prod.image);
    setNewDescription(prod.description);
    setSelectedSizes(prod.sizes || ['M', 'L', 'XL']);
    setProductColors(prod.colors || [{ name: 'Qora', hex: '#000000', image: prod.image }]);
    setIsAddingProduct(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Metrics
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid' || o.orderStatus === 'delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrdersCount = orders.filter((o) => o.paymentStatus === 'receipt_submitted' || o.orderStatus === 'new').length;

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'paid' && o.paymentStatus !== 'paid') return false;
    if (orderStatusFilter === 'rejected' && o.paymentStatus !== 'rejected') return false;
    if (orderStatusFilter === 'delivered' && o.orderStatus !== 'delivered') return false;
    if (orderStatusFilter === 'new' && o.orderStatus !== 'new' && o.paymentStatus !== 'receipt_submitted') return false;

    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase().trim();
      const mNum = o.orderNumber.toLowerCase().includes(q);
      const mName = (o.customerName || '').toLowerCase().includes(q);
      const mPhone = (o.phone || '').toLowerCase().includes(q);
      const mCity = (o.city || '').toLowerCase().includes(q);
      if (!mNum && !mName && !mPhone && !mCity) return false;
    }
    return true;
  });

  const handleExportOrdersCSV = () => {
    const headers = ['Buyurtma', 'Sana', 'Mijoz', 'Telefon', 'Shahar', 'Manzil', 'Summa', "To'lov", 'Holat'];
    const rows = filteredOrders.map((o) => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toLocaleDateString()}"`,
      `"${o.customerName}"`,
      `"${o.phone}"`,
      `"${o.city}"`,
      `"${o.address}"`,
      o.totalAmount,
      `"${o.paymentStatus}"`,
      `"${o.orderStatus}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `modestyle_buyurtmalar_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If not authenticated, render dedicated full-page Admin Login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans selection:bg-amber-400 selection:text-black">
        {/* Top bar back link */}
        <header className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black tracking-tight text-lg">
            <Shield className="w-5 h-5 text-amber-400" />
            <span>MODESTYLE ADMIN PORTAL</span>
          </div>
          <button
            type="button"
            onClick={onBackToStore}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all border border-zinc-800 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Do'konga qaytish</span>
          </button>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 rounded-3xl border border-zinc-800 p-8 space-y-6 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-black border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-white uppercase tracking-wide">
                Admin Boshqaruv Markazi
              </h2>
              <p className="text-xs text-zinc-400">
                Ushbu bo'lim faqat do'kon ma'murlari uchun mo'ljallangan. Kirish uchun Google orqali tasdiqlang yoki parolni kiriting.
              </p>
            </div>

            {/* Google Sign In Option */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={onLoginGoogle}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-black font-bold text-xs flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md"
              >
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
                <span>Google (Admin) orqali kirish</span>
              </button>

              <div className="flex items-center gap-3 text-zinc-600 text-xs my-2">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="uppercase font-mono text-[10px]">yoki parol bilan</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              {/* PIN Code form */}
              <form onSubmit={handleVerifyPin} className="space-y-3">
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    autoFocus
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Admin PIN kodini kiriting"
                    className={`w-full px-4 py-3 pr-11 rounded-xl text-center text-lg font-mono font-bold tracking-widest outline-none border transition-colors ${
                      pinError
                        ? 'border-rose-500 bg-rose-950/40 text-rose-200'
                        : 'border-zinc-700 focus:border-amber-400 bg-black text-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer p-1"
                  >
                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs transition-colors cursor-pointer shadow-md"
                >
                  Boshqaruv markazini ochish
                </button>
              </form>
            </div>

            <div className="pt-2 text-[11px] text-zinc-500 font-mono">
              Standart master-kod: <strong>7788</strong> yoki <strong>7777</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Standalone Admin Site Header */}
      <header className="sticky top-0 z-40 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Status */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black text-base shadow-md">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-sm sm:text-base tracking-wide uppercase text-white">
                  modestyle admin portal
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Onlayn
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Yagona boshqaruv portali &middot; {currentUser?.email || "Davron (Admin)"}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-xl bg-black border border-zinc-800">
              <span className="text-zinc-500 text-[10px] block">JAMI BUYURTMALAR:</span>
              <span className="font-bold text-white text-sm">{orders.length} ta</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-black border border-zinc-800">
              <span className="text-zinc-500 text-[10px] block">KUTILAYOTGAN:</span>
              <span className="font-bold text-amber-400 text-sm">{pendingOrdersCount} ta</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-black border border-zinc-800">
              <span className="text-zinc-500 text-[10px] block">JAMI TUSHUM:</span>
              <span className="font-bold text-emerald-400 text-sm">{formatSums(totalRevenue)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToStore}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black transition-all cursor-pointer shadow-sm"
              title="Xaridorlar do'koniga o'tish"
            >
              <Store className="w-4 h-4" />
              <span>Do'konga o'tish</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                setPinUnlocked(false);
                if (currentUser) await onLogout();
              }}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Chiqish / Qulflash"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto py-2 border-t border-zinc-800/80 text-xs font-mono font-bold scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'stats'
                ? 'bg-amber-400 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Statistika</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'orders'
                ? 'bg-amber-400 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Buyurtmalar ({orders.length})</span>
            {pendingOrdersCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'orders' ? 'bg-black text-amber-400' : 'bg-amber-400 text-black'
              }`}>
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('customers')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'customers'
                ? 'bg-amber-400 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Mijozlar Ro'yxati</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('operator')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'operator'
                ? 'bg-amber-400 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Ruler className="w-4 h-4" />
            <span>Jacob Razmer ({opRules.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'chat'
                ? 'bg-amber-400 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Jonli Chat ({chatMessages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'products'
                ? 'bg-amber-400 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Mahsulotlar ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('banners')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'banners'
                ? 'bg-amber-400 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Bannerlar ({bannerList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'card'
                ? 'bg-amber-400 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Karta & To'lov</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('promos')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'promos'
                ? 'bg-amber-400 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Promokodlar ({promoList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('telegram')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'telegram'
                ? 'bg-sky-500 text-white font-black shadow-md'
                : 'text-zinc-400 hover:text-sky-400 hover:bg-sky-950/50'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Telegram Bot (@{tgBotUsername})</span>
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* TAB 0: STATS & ANALYTICS */}
        {activeTab === 'stats' && (
          <AdminStatsTab orders={orders} products={products} />
        )}

        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Top bar with filter buttons & CSV export */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm uppercase tracking-wider text-white">
                  Buyurtmalar Boshqaruvi
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportOrdersCSV}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors border border-zinc-700 shadow-sm"
                  title="Buyurtmalarni CSV formatda yuklab olish"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV Eksport ({filteredOrders.length})</span>
                </button>
              </div>
            </div>

            {/* Search and status filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buyurtma raqami, mijoz ismi, telefon, shahar bo'yicha qidiruv..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 rounded-xl bg-black border border-zinc-700 focus:border-amber-400 text-white text-xs outline-none transition-colors"
                />
                {orderSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setOrderSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setOrderStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    orderStatusFilter === 'all' ? 'bg-white text-black font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Barchasi ({orders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderStatusFilter('new')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    orderStatusFilter === 'new' ? 'bg-amber-400 text-black font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Kutilmoqda ({pendingOrdersCount})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderStatusFilter('paid')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    orderStatusFilter === 'paid' ? 'bg-emerald-500 text-white font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Tasdiqlangan ({orders.filter((o) => o.paymentStatus === 'paid').length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderStatusFilter('delivered')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    orderStatusFilter === 'delivered' ? 'bg-sky-500 text-white font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Yetkazilgan ({orders.filter((o) => o.orderStatus === 'delivered').length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderStatusFilter('rejected')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    orderStatusFilter === 'rejected' ? 'bg-rose-500 text-white font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Rad etilgan ({orders.filter((o) => o.paymentStatus === 'rejected').length})
                </button>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-24 bg-zinc-900/50 rounded-3xl border border-zinc-800 text-zinc-500 text-xs">
                Bu toifada buyurtmalar mavjud emas.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-sm hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-xs bg-amber-400 text-black px-2.5 py-1 rounded-lg">
                          {ord.orderNumber}
                        </span>
                        <span className="text-xs text-zinc-400 font-mono">
                          {new Date(ord.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {ord.paymentStatus === 'paid' ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            To'lov Tasdiqlangan
                          </span>
                        ) : ord.paymentStatus === 'rejected' ? (
                          <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs">
                            Chek Rad Etilgan
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30 font-bold text-xs flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Chek Kutilmoqda
                          </span>
                        )}

                        <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 font-mono text-[11px]">
                          Holat: {ord.orderStatus}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-zinc-500 block text-[10px] uppercase font-mono">Mijoz:</span>
                        <span className="font-bold text-white text-sm block">{ord.customerName}</span>
                        {ord.email && (
                          <span className="block text-zinc-400 font-mono">{ord.email}</span>
                        )}
                        <a href={`tel:${ord.phone}`} className="font-mono block text-amber-400 hover:underline">
                          {ord.phone}
                        </a>
                      </div>
                      <div className="space-y-1">
                        <span className="text-zinc-500 block text-[10px] uppercase font-mono">Yetkazish manzili:</span>
                        <span className="text-zinc-200 font-medium block">{ord.city}, {ord.address}</span>
                        {ord.notes && (
                          <p className="text-[11px] text-zinc-400 italic bg-black/40 p-2 rounded-lg border border-zinc-800">
                            Izoh: {ord.notes}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <span className="text-zinc-500 block text-[10px] uppercase font-mono">Buyurtma summasi:</span>
                        <span className="font-mono font-black text-lg text-emerald-400 block">
                          {formatSums(ord.totalAmount)}
                        </span>
                        {ord.promoCode && (
                          <span className="text-[10px] font-mono text-zinc-400">Promokod: {ord.promoCode}</span>
                        )}
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="p-3.5 rounded-2xl bg-black border border-zinc-800 text-xs space-y-2">
                      {ord.items.map((it, i) => (
                        <div key={i} className="flex items-center justify-between text-zinc-300">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{it.product.title}</span>
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-mono">
                              {it.selectedSize}
                            </span>
                            {it.selectedColor && (
                              <span className="text-[11px] text-zinc-500">({it.selectedColor})</span>
                            )}
                            <span className="text-zinc-500">x {it.quantity}</span>
                          </div>
                          <span className="font-mono font-bold text-white">
                            {formatSums(it.product.price * it.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Actions & Receipt & Invoice */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {ord.receiptImage ? (
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(ord.receiptImage || null)}
                            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-zinc-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span>To'lov Cheki</span>
                          </button>
                        ) : (
                          <span className="text-xs text-zinc-500 italic">Chek yuklanmagan (Naqd / Telegram)</span>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceOrder(ord)}
                          className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-zinc-700 transition-colors"
                          title="Chop etiladigan rasmiy invoys cheki"
                        >
                          <Printer className="w-4 h-4 text-amber-400" />
                          <span>Invoys / Chek</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOrderReceiptStatus(ord, 'paid')}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Check className="w-4 h-4" />
                          <span>Chekni Tasdiqlash</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOrderReceiptStatus(ord, 'rejected')}
                          className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-400 hover:text-rose-300 text-xs font-bold cursor-pointer"
                        >
                          Rad etish
                        </button>
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(ord, e.target.value as Order['orderStatus'])}
                          className="px-3 py-2 rounded-xl bg-black border border-zinc-700 text-white text-xs font-mono cursor-pointer"
                        >
                          <option value="new">Yangi</option>
                          <option value="processing">Jarayonda</option>
                          <option value="shipped">Yetkazilmoqda</option>
                          <option value="delivered">Yetkazib berildi</option>
                          <option value="cancelled">Bekor qilindi</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 1.5: CUSTOMERS / CRM */}
        {activeTab === 'customers' && (
          <AdminCustomersTab orders={orders} />
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center bg-zinc-900 p-4 rounded-2xl border border-zinc-800 gap-3">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider text-white">
                  Katalogdagi Mahsulotlar ({products.length} ta)
                </h3>
                <p className="text-xs text-zinc-400">Do'kondagi barcha kiyim va poyabzallarni boshqarish</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingProductId(null);
                  setNewTitle('');
                  setIsAddingProduct(!isAddingProduct);
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi Mahsulot Qo'shish</span>
              </button>
            </div>

            {/* Add / Edit Form */}
            {isAddingProduct && (
              <form onSubmit={handleCreateProduct} className="p-6 rounded-3xl bg-zinc-900 border border-amber-400/40 space-y-5 shadow-2xl">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <span className="font-mono font-bold text-xs uppercase text-amber-400">
                    {editingProductId ? "Mahsulotni tahrirlash" : "Yangi mahsulot kiritish"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingProduct(false);
                      setEditingProductId(null);
                    }}
                    className="text-zinc-500 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-zinc-300 block mb-1">Nomi:</label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: Nike Air Jordan Retro High"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-zinc-700 text-white outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-300 block mb-1">Brend:</label>
                    <input
                      type="text"
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-zinc-700 text-white outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-300 block mb-1">Kategoriya:</label>
                    <select
                      value={newCategory}
                      onChange={(e) => {
                        const cat = e.target.value;
                        setNewCategory(cat);
                        if (cat === 'sneakers') {
                          setSelectedSizes(['40', '41', '42', '43']);
                        } else {
                          setSelectedSizes(['M', 'L', 'XL']);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-zinc-700 text-white outline-none focus:border-amber-400 font-medium"
                    >
                      <option value="sneakers">Krossovkalar</option>
                      <option value="hoodies">Hudi & Svitshot</option>
                      <option value="tshirts">Futbolkalar</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-zinc-300 block mb-1">Narxi (so'm):</label>
                    <input
                      type="number"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-zinc-700 text-white outline-none focus:border-amber-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-300 block mb-1">Asosiy rasm URL:</label>
                    <input
                      type="text"
                      required
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-zinc-700 text-white outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-300 block mb-1">Eski narx (aksiyada, ixtiyoriy):</label>
                    <input
                      type="number"
                      value={newOldPrice}
                      onChange={(e) => setNewOldPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-zinc-700 text-white outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                {/* Sizes Selection */}
                <div className="space-y-2 p-4 bg-black rounded-2xl border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-zinc-300">
                      Mavjud razmerlar: ({selectedSizes.join(', ')})
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(newCategory === 'sneakers' ? SHOE_SIZES : CLOTHING_SIZES).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleToggleSize(s)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                          selectedSizes.includes(s)
                            ? 'bg-amber-400 text-black shadow-xs'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingProduct(false);
                      setEditingProductId(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold cursor-pointer"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs cursor-pointer shadow-md"
                  >
                    {editingProductId ? "O'zgarishlarni saqlash" : "Mahsulotni qo'shish"}
                  </button>
                </div>
              </form>
            )}

            {/* Products grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden flex flex-col justify-between p-3.5 space-y-3 hover:border-zinc-700 transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-black border border-zinc-800">
                      <img
                        src={prod.image}
                        alt={prod.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-white text-[10px] font-mono">
                        {prod.categoryName}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-mono text-amber-400 font-bold">
                        {prod.brand}
                      </span>
                      <h4 className="font-bold text-sm text-white line-clamp-1">
                        {prod.title}
                      </h4>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-mono font-black text-sm text-white">
                          {formatSums(prod.price)}
                        </span>
                        {prod.oldPrice && (
                          <span className="font-mono text-xs text-zinc-500 line-through">
                            {formatSums(prod.oldPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {prod.sizes.map((s) => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-black text-zinc-400 text-[10px] font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => handleStartEditProduct(prod)}
                      className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Tahrirlash</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Haqiqatan ham "${prod.title}" mahsulotini o'chirmoqchimisiz?`)) {
                          onDeleteProduct(prod.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-900/50 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: BANNERS */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider text-white">
                  Bosh Sahifa Bannerlari ({bannerList.length} ta)
                </h3>
                <p className="text-xs text-zinc-400">Do'kon bosh sahifasidagi asosiy slaydlar</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddBanner}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi slayd</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveBanners}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Saqlash</span>
                </button>
              </div>
            </div>

            {bannerSavedSuccess && (
              <div className="p-3 bg-emerald-950 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Bannerlar muvaffaqiyatli saqlandi!</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bannerList.map((banner, idx) => (
                <div key={banner.id} className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                    <span className="font-mono font-bold text-xs text-amber-400">Slayd #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="text-zinc-500 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-zinc-400 block mb-1">Sarlavha (Title):</label>
                      <input
                        type="text"
                        value={banner.title}
                        onChange={(e) => handleBannerChange(idx, 'title', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Quyi sarlavha (Subtitle):</label>
                      <input
                        type="text"
                        value={banner.subtitle}
                        onChange={(e) => handleBannerChange(idx, 'subtitle', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Rasm URL:</label>
                      <input
                        type="text"
                        value={banner.image}
                        onChange={(e) => handleBannerChange(idx, 'image', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-700 text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PAYMENT CARD */}
        {activeTab === 'card' && (
          <div className="max-w-xl mx-auto space-y-5">
            <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">To'lov Kartasi Sozlamalari</h3>
                  <p className="text-xs text-zinc-400">Xaridorlar to'lov cheki yuklaydigan karta raqami</p>
                </div>
              </div>

              {cardSavedSuccess && (
                <div className="p-3 bg-emerald-950 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Karta ma'lumotlari saqlandi!</span>
                </div>
              )}

              <form onSubmit={handleSaveCard} className="space-y-4 text-xs">
                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Karta raqami (16 xonali):</label>
                  <input
                    type="text"
                    required
                    value={cardForm.cardNumber}
                    onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-700 text-white font-mono text-base font-bold outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Karta egasining ismi:</label>
                  <input
                    type="text"
                    required
                    value={cardForm.cardHolder}
                    onChange={(e) => setCardForm({ ...cardForm, cardHolder: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-700 text-white font-bold outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Bank nomi:</label>
                  <input
                    type="text"
                    required
                    value={cardForm.bankName}
                    onChange={(e) => setCardForm({ ...cardForm, bankName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-700 text-white outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs transition-colors cursor-pointer shadow-md"
                >
                  Saqlash
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: PROMO CODES */}
        {activeTab === 'promos' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-4">
              <h3 className="font-black text-sm uppercase tracking-wider text-white">
                Yangi Promokod Qo'shish
              </h3>
              <form onSubmit={handleAddPromo} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1">Kod:</label>
                  <input
                    type="text"
                    placeholder="SALE20"
                    value={newPromoCode}
                    onChange={(e) => setNewPromoCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-700 text-white font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Miqdor (% yoki so'm):</label>
                  <input
                    type="number"
                    value={newPromoValue}
                    onChange={(e) => setNewPromoValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Turi:</label>
                  <select
                    value={newPromoType}
                    onChange={(e) => setNewPromoType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-700 text-white"
                  >
                    <option value="percentage">Foiz (%)</option>
                    <option value="fixed">Aniq summa (so'm)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black cursor-pointer shadow-md"
                  >
                    Qo'shish
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {promoList.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-black text-sm text-amber-400">{p.code}</span>
                    <p className="text-xs text-zinc-400">{p.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePromo(p.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        p.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {p.active ? 'Faol' : 'Nofaol'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePromo(p.id)}
                      className="text-zinc-500 hover:text-rose-400 cursor-pointer p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: CHAT */}
        {activeTab === 'chat' && (
          <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-4 max-w-3xl mx-auto">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-black text-sm uppercase text-white">Mijozlar bilan Jonli Chat</h3>
                <p className="text-xs text-zinc-400">Do'kon xaridorlari bilan to'g'ridan-to'g'ri bog'lanish va maslahat</p>
              </div>
              {onClearChat && (
                <button
                  type="button"
                  onClick={onClearChat}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Tarixni tozalash
                </button>
              )}
            </div>

            <div className="h-96 overflow-y-auto space-y-3 p-4 bg-black rounded-2xl border border-zinc-800 text-xs">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
                  <p>Hozircha xabarlar yo'q.</p>
                </div>
              ) : (
                chatMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-zinc-500 mb-1 px-1">
                      {m.sender === 'user' ? 'Mijoz' : m.sender === 'admin' ? 'Admin' : 'Operator (Jacob)'}
                    </span>
                    <div
                      className={`max-w-[80%] p-3.5 rounded-2xl shadow-sm ${
                        m.sender === 'user'
                          ? 'bg-amber-400 text-black font-medium'
                          : m.sender === 'admin'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-800 text-white border border-zinc-700'
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                      <span className="text-[9px] opacity-70 block mt-1.5 text-right">{m.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick response chips for admin */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase block">
                Tezkor javob shablonlari:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "170 sm va 77 kg uchun 2XL razmer juda qulay tushadi!",
                  "To'lov chekingiz tasdiqlandi, buyurtma tayyorlanmoqda.",
                  "Buyurtmangiz kuryerga berildi, 2-3 soatda yetkaziladi.",
                  "Toshkent bo'ylab yetkazib berish bepul!",
                  "Bo'yingiz va vazningizni aytsangiz, aniq razmerni aytib beramiz."
                ].map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAdminReplyText(tpl)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] cursor-pointer transition-colors border border-zinc-700/60"
                  >
                    {tpl.length > 36 ? tpl.slice(0, 36) + '...' : tpl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Mijozga admin sifatida javob yozish..."
                value={adminReplyText}
                onChange={(e) => setAdminReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && adminReplyText.trim()) {
                    onSendAdminMessage(adminReplyText.trim());
                    setAdminReplyText('');
                  }
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-black border border-zinc-700 text-white text-xs outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => {
                  if (adminReplyText.trim()) {
                    onSendAdminMessage(adminReplyText.trim());
                    setAdminReplyText('');
                  }
                }}
                className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Yuborish</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 7: OPERATOR & SIZE RULES (JACOB) */}
        {activeTab === 'operator' && (
          <AdminOperatorSizeTab
            operatorConfig={operatorConfig}
            onUpdateOperatorConfig={onUpdateOperatorConfig}
          />
        )}

        {/* TAB 8: TELEGRAM BOT & SOCIALS */}
        {activeTab === 'telegram' && (
          <div className="bg-zinc-900 p-6 md:p-8 rounded-3xl border border-zinc-800 space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">Telegram Bot & Ijtimoiy Tarmoqlar</h3>
                <p className="text-xs text-zinc-400">Bot xavfsizligi, buyurtma bildirishnomalari va rasmiy kanallar</p>
              </div>
            </div>

            {/* Privacy & Anti-Leak banner */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex gap-3 items-start">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-white">Maxfiylik va Xavfsizlik himoyasi yoqilgan!</p>
                <p className="text-zinc-300 leading-relaxed">
                  Begona odamlar yoki oddiy mijozlar botga kirganda do'kon statistikasi (savdo hajmi) va buyurtmalar (mijozlar telefonlari, manzillari) <b>hech qachon ko'rsatilmaydi</b>. Ularga faqat do'kon reklamasi, saytga kirish tugmasi, Telegram kanal va Instagram havolalari ko'rinadi.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Bot Core Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Bot Token:</label>
                  <input
                    type="text"
                    value={tgToken}
                    onChange={(e) => setTgToken(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-700 text-white font-mono text-xs focus:border-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Admin Telegram Chat ID:</label>
                  <input
                    type="text"
                    value={tgChatId}
                    onChange={(e) => setTgChatId(e.target.value)}
                    placeholder="2002780745"
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-700 text-white font-mono text-xs focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              {/* Bot Username & Admin PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Telegram Bot Username:</label>
                  <input
                    type="text"
                    value={tgBotUsername}
                    onChange={(e) => setTgBotUsername(e.target.value)}
                    placeholder="@Modestyleuzbot"
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-700 text-white font-mono text-xs focus:border-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Admin maxfiy PIN kodi:</label>
                  <input
                    type="text"
                    value={tgAdminPin}
                    onChange={(e) => setTgAdminPin(e.target.value)}
                    placeholder="1234"
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-700 text-white font-mono text-xs focus:border-amber-400 outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">
                    Boshqa telefondan botda <code>/login {tgAdminPin || '1234'}</code> yozsangiz admin huquqini beradi.
                  </span>
                </div>
              </div>

              {/* Social Channels & Marketing links */}
              <div className="pt-3 border-t border-zinc-800 space-y-3">
                <h4 className="font-black text-sm text-amber-400 uppercase tracking-wide">
                  📢 Reklama va Ijtimoiy Kanallar (Telegram, Instagram, Sayt)
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Kanal va Instagramingizni ochganingizda ularning havolasini shu yerga yozib saqlang. Bot va sayt avtomatik ravishda ushbu kanallarni reklama qiladi!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-300 font-bold block mb-1">📢 Telegram Kanal havolasi:</label>
                    <input
                      type="text"
                      value={tgChannel}
                      onChange={(e) => setTgChannel(e.target.value)}
                      placeholder="https://t.me/modestyle_uz yoki @modestyle_uz"
                      className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-700 text-white text-xs focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-bold block mb-1">📸 Instagram sahifa havolasi:</label>
                    <input
                      type="text"
                      value={tgInstagram}
                      onChange={(e) => setTgInstagram(e.target.value)}
                      placeholder="https://instagram.com/modestyle.uz yoki @modestyle.uz"
                      className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-700 text-white text-xs focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-300 font-bold block mb-1">💬 Admin / Operator Telegram (@username):</label>
                    <input
                      type="text"
                      value={tgAdminUser}
                      onChange={(e) => setTgAdminUser(e.target.value)}
                      placeholder="@kwezr"
                      className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-700 text-white text-xs focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-bold block mb-1">🌐 Rasmiy Sayt URL:</label>
                    <input
                      type="text"
                      value={tgSiteUrl}
                      onChange={(e) => setTgSiteUrl(e.target.value)}
                      placeholder="https://modestyle.uz"
                      className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-700 text-white text-xs focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  disabled={tgTestLoading}
                  onClick={async () => {
                    setTgTestLoading(true);
                    setTgTestResult(null);
                    try {
                      const res = await sendTelegramMessage(
                        {
                          botToken: tgToken,
                          chatId: tgChatId,
                          botUsername: tgBotUsername,
                          enabled: true,
                          notifyOrders: tgNotifyOrders,
                          notifyChat: tgNotifyChat,
                          telegramChannel: tgChannel,
                          instagramProfile: tgInstagram,
                          adminUsername: tgAdminUser,
                          storeWebsiteUrl: tgSiteUrl,
                          adminPin: tgAdminPin,
                        },
                        "🚀 <b>ModeStyle Admin Sinovi</b>\nTelegram boti va administrator kanali muvaffaqiyatli bog'landi!"
                      );
                      setTgTestResult({
                        success: res.ok,
                        msg: res.ok
                          ? "Admin Telegramiga test xabari yuborildi!"
                          : (res.error || "Xatolik yuz berdi"),
                      });
                    } catch (err: any) {
                      setTgTestResult({ success: false, msg: err.message });
                    } finally {
                      setTgTestLoading(false);
                    }
                  }}
                  className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold cursor-pointer text-center transition-colors text-xs"
                >
                  {tgTestLoading ? "Yuborilmoqda..." : "🚀 Admin sinov xabari"}
                </button>

                <button
                  type="button"
                  disabled={tgTestLoading}
                  onClick={async () => {
                    setTgTestLoading(true);
                    setTgTestResult(null);
                    try {
                      const cleanChan = tgChannel.startsWith('http') ? tgChannel : `https://t.me/${tgChannel.replace(/^@/, '')}`;
                      const cleanInst = tgInstagram.startsWith('http') ? tgInstagram : `https://instagram.com/${tgInstagram.replace(/^@/, '')}`;
                      const cleanAdm = tgAdminUser.startsWith('http') ? tgAdminUser : `https://t.me/${tgAdminUser.replace(/^@/, '')}`;

                      const promoPreview =
                        `✨ <b>MODESTYLE.UZ — RASMIY ONLAYN DO'KONI!</b> 🛍👕👟\n` +
                        `━━━━━━━━━━━━━━━━━━━━━\n` +
                        `<i>(Mijozlarga ko'rinadigan rasmiy reklama sinovi)</i>\n\n` +
                        `Assalomu alaykum! Zamonaviy streetwear kiyimlar va eng so'nggi urfdagi brend krossovkalar do'konimizga xush kelibsiz!\n\n` +
                        `🔥 <b>Bizning afzalliklarimiz:</b>\n` +
                        `• 100% Sifatli materiallar va original dizayn\n` +
                        `• Toshkent shahrida 2-3 soatda tezkor yetkazib berish 🚀\n` +
                        `• Butun O'zbekiston bo'ylab tezkor pochta 📦\n` +
                        `• To'lovni tovar yetib kelganda naqd yoki karta orqali to'lash!\n` +
                        `• Jacob operatorimiz bo'y va vazningizga mos aniq razmerni (masalan: 170 sm va 77 kg uchun 2XL) tanlab beradi 📏\n\n` +
                        `📢 <b>Telegram Kanal:</b> ${tgChannel}\n` +
                        `📸 <b>Instagram:</b> ${tgInstagram}\n` +
                        `🌐 <b>Sayt:</b> ${tgSiteUrl}`;

                      const res = await sendTelegramMessage(
                        {
                          botToken: tgToken,
                          chatId: tgChatId,
                          botUsername: tgBotUsername,
                          enabled: true,
                          notifyOrders: tgNotifyOrders,
                          notifyChat: tgNotifyChat,
                        },
                        promoPreview,
                        'HTML',
                        {
                          inline_keyboard: [
                            [{ text: '🛍 Saytga kirish va Xarid qilish', url: tgSiteUrl || 'https://modestyle.uz' }],
                            [
                              { text: '📢 Telegram Kanal', url: cleanChan },
                              { text: '📸 Instagram Sahifa', url: cleanInst },
                            ],
                            [{ text: '💬 Operator bilan bog\'lanish', url: cleanAdm }],
                          ],
                        }
                      );
                      setTgTestResult({
                        success: res.ok,
                        msg: res.ok
                          ? "Mijozlar reklamasi sizning Telegramingizga sinov sifatida yuborildi!"
                          : (res.error || "Xatolik yuz berdi"),
                      });
                    } catch (err: any) {
                      setTgTestResult({ success: false, msg: err.message });
                    } finally {
                      setTgTestLoading(false);
                    }
                  }}
                  className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold cursor-pointer text-center transition-colors text-xs"
                >
                  👁 Reklamani ko'rish (Test)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateTelegramConfig) {
                      onUpdateTelegramConfig({
                        ...telegramConfig!,
                        botToken: tgToken,
                        chatId: tgChatId,
                        botUsername: tgBotUsername,
                        enabled: tgEnabled,
                        notifyOrders: tgNotifyOrders,
                        notifyChat: tgNotifyChat,
                        telegramChannel: tgChannel,
                        instagramProfile: tgInstagram,
                        adminUsername: tgAdminUser,
                        storeWebsiteUrl: tgSiteUrl,
                        adminPin: tgAdminPin,
                        welcomePromoText: tgPromoText,
                      });
                      setTgSavedSuccess(true);
                      setTimeout(() => setTgSavedSuccess(false), 2500);
                    }
                  }}
                  className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black cursor-pointer shadow-md transition-colors text-xs"
                >
                  {tgSavedSuccess ? "Saqlandi! ✓" : "Saqlash"}
                </button>
              </div>

              {tgTestResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    tgTestResult.success
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-rose-950/80 border-rose-500 text-rose-300'
                  }`}
                >
                  {tgTestResult.msg}
                </div>
              )}

              {/* Telegram Customers & Saved Real Locations Section */}
              <div className="pt-6 border-t border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-sky-400 uppercase tracking-wide flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span>Telegramdan Ro'yxatdan O'tgan Mijozlar & Lokatsiyalar</span>
                      </h4>
                      <span className="px-2 py-0.5 rounded-md bg-sky-950 border border-sky-500/40 text-sky-300 text-[10px] font-mono font-bold">
                        {telegramCustomers.length} ta mijoz
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Mijozlar Telegram bot orqali "📍 Manzil / Lokatsiya yuborish" va "📱 Telefon raqamni yuborish" tugmalarini bosganda, ularning haqiqiy GPS koordinatalari va raqamlari avtomatik ravishda bu yerda saqlanadi.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTelegramCustomers(getStoredTelegramCustomers())}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Yangilash</span>
                    </button>
                    {/* Customer profiles are protected */}
                    <div className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-[11px] font-mono flex items-center gap-1.5" title="Mijozlar bazasi xavfsiz va operator tomonidan o'chirilmaydi">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Himoyalangan</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const sample = {
                          chatId: String(Math.floor(100000000 + Math.random() * 900000000)),
                          firstName: 'Davron',
                          lastName: 'Karimov',
                          username: '@davron_modestyle',
                          phone: '+998901234567',
                          location: {
                            latitude: 41.311158,
                            longitude: 69.279737,
                            googleMapUrl: 'https://www.google.com/maps?q=41.311158,69.279737',
                            yandexMapUrl: 'https://yandex.uz/maps/?pt=69.279737,41.311158&z=16&l=map',
                          },
                          registeredAt: new Date().toISOString(),
                          lastActive: new Date().toISOString(),
                        };
                        saveStoredTelegramCustomer(sample);
                        setTelegramCustomers(getStoredTelegramCustomers());
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Lokatsiya funksiyasini tekshirish uchun test mijoz qo'shish"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Sinov lokatsiyasi qo'shish</span>
                    </button>
                  </div>
                </div>

                {/* Filter and search */}
                {telegramCustomers.length > 0 && (
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      placeholder="Mijoz ismi, username, telefon yoki Chat ID bo'yicha qidirish..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:border-sky-400 outline-none"
                    />
                  </div>
                )}

                {/* Customers list */}
                {telegramCustomers.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-black/60 border border-dashed border-zinc-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-sky-950/80 border border-sky-600/30 text-sky-400 mx-auto flex items-center justify-center">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-white">Hozircha saqlangan mijozlar lokatsiyasi yo'q</h5>
                      <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 leading-relaxed">
                        Telegramda <code>@{tgBotUsername?.replace(/^@/, '') || 'Modestyleuzbot'}</code> botiga kirib <b>/start</b> bosing va <b>"📍 Manzil / Lokatsiya yuborish"</b> yoki <b>"📱 Telefon raqamni yuborish"</b> tugmasini bosing. Siz yuborgan aniq manzil darhol shu yerda paydo bo'ladi va xaritada ochiladi!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {telegramCustomers
                      .filter((c) => {
                        if (!customerSearchQuery.trim()) return true;
                        const q = customerSearchQuery.toLowerCase();
                        return (
                          (c.firstName || '').toLowerCase().includes(q) ||
                          (c.lastName || '').toLowerCase().includes(q) ||
                          (c.username || '').toLowerCase().includes(q) ||
                          (c.phone || '').includes(q) ||
                          c.chatId.includes(q)
                        );
                      })
                      .map((cust) => (
                        <div
                          key={cust.chatId}
                          className="p-4 rounded-2xl bg-black/80 border border-zinc-800 hover:border-zinc-700 transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-sky-950 border border-sky-600/40 text-sky-400 flex items-center justify-center font-bold text-xs uppercase">
                                {cust.firstName ? cust.firstName[0] : 'M'}
                              </div>
                              <div>
                                <h6 className="font-bold text-xs text-white flex items-center gap-1.5">
                                  <span>{cust.firstName || ''} {cust.lastName || ''}</span>
                                  {cust.location && (
                                    <span className="w-2 h-2 rounded-full bg-emerald-400" title="Lokatsiya mavjud" />
                                  )}
                                </h6>
                                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                                  {cust.username ? (
                                    <a
                                      href={`https://t.me/${cust.username.replace(/^@/, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-sky-400 hover:underline"
                                    >
                                      {cust.username}
                                    </a>
                                  ) : (
                                    <span>ID: {cust.chatId}</span>
                                  )}
                                  <span>&middot;</span>
                                  <span>{new Date(cust.lastActive).toLocaleDateString('uz-UZ')}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setDirectMsgModal({
                                  isOpen: true,
                                  customer: cust,
                                  text: '',
                                  loading: false,
                                  status: null,
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 border border-sky-700/50 text-sky-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Telegramdan to'g'ridan-to'g'ri xabar yuborish"
                            >
                              <SendHorizontal className="w-3 h-3" />
                              <span>Xabar</span>
                            </button>
                          </div>

                          {/* Location Card */}
                          {cust.location ? (
                            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-emerald-400 flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span>Haqiqiy GPS Manzil:</span>
                                </span>
                                <span className="font-mono text-[10px] text-emerald-300">
                                  {cust.location.latitude.toFixed(4)}, {cust.location.longitude.toFixed(4)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 pt-1">
                                <a
                                  href={cust.location.googleMapUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-600/40 text-emerald-200 font-bold text-[11px] text-center flex items-center justify-center gap-1 transition-colors"
                                >
                                  <Map className="w-3 h-3" />
                                  <span>Google Maps 🗺</span>
                                </a>
                                <a
                                  href={cust.location.yandexMapUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex-1 py-1.5 px-2 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-600/40 text-amber-200 font-bold text-[11px] text-center flex items-center justify-center gap-1 transition-colors"
                                >
                                  <Navigation className="w-3 h-3" />
                                  <span>Yandex Kuryer 🚕</span>
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-500 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-zinc-600" />
                              <span>Lokatsiya hali yuborilmagan</span>
                            </div>
                          )}

                          {/* Contact Phone */}
                          {cust.phone ? (
                            <div className="flex items-center justify-between text-[11px] px-2 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
                              <span className="text-zinc-400 flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-sky-400" />
                                <span>Telefon raqami:</span>
                              </span>
                              <a
                                href={`tel:${cust.phone}`}
                                className="font-mono font-bold text-sky-400 hover:underline"
                              >
                                {cust.phone}
                              </a>
                            </div>
                          ) : (
                            <div className="text-[11px] text-zinc-500 px-2 flex items-center gap-1.5">
                              <Smartphone className="w-3.5 h-3.5 text-zinc-600" />
                              <span>Telefon raqami ulanmagan</span>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Direct Telegram Message Modal */}
      {directMsgModal.isOpen && directMsgModal.customer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setDirectMsgModal({ ...directMsgModal, isOpen: false })}
        >
          <div
            className="relative max-w-lg w-full bg-zinc-900 rounded-3xl p-5 border border-zinc-700 shadow-2xl space-y-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-950 border border-sky-500/40 text-sky-400 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    Mijozga Telegram orqali xabar yuborish
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Qabul qiluvchi: {directMsgModal.customer.firstName} {directMsgModal.customer.lastName} ({directMsgModal.customer.username || `ID: ${directMsgModal.customer.chatId}`})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDirectMsgModal({ ...directMsgModal, isOpen: false })}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* In-Bot Conversation History */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-300 flex items-center justify-between">
                <span>Bot orqali yozishmalar tarixi:</span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {directMsgModal.customer?.messages?.length || 0} ta xabar
                </span>
              </label>
              <div className="max-h-48 min-h-24 overflow-y-auto p-3 rounded-xl bg-black border border-zinc-800 space-y-2.5">
                {directMsgModal.customer?.messages && directMsgModal.customer.messages.length > 0 ? (
                  directMsgModal.customer.messages.map((m) => {
                    const isCustomer = m.sender === 'customer';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[10px] font-bold ${isCustomer ? 'text-sky-400' : 'text-emerald-400'}`}>
                            {isCustomer ? directMsgModal.customer?.firstName || 'Mijoz' : 'Operator (Siz)'}
                          </span>
                          <span className="text-[9px] text-zinc-600 font-mono">
                            {new Date(m.timestamp).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div
                          className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                            isCustomer
                              ? 'bg-zinc-900 border border-zinc-800 text-zinc-200'
                              : 'bg-sky-950/70 border border-sky-600/40 text-sky-200'
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-5 text-zinc-600 text-xs">
                    Hozircha bot orqali xabarlar almashinmagan. Quyida xabar yozib mijozga yuborishingiz mumkin.
                  </div>
                )}
              </div>
            </div>

            {/* Quick Templates */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 block">Tayyor tezkor andozalar:</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Assalomu alaykum! Buyurtmangiz qabul qilindi va kuryerga berildi 🚀",
                  "Lokatsiyangiz tasdiqlandi, 2-3 soat ichida yetkazib beramiz! 📦",
                  "Hurmatli mijoz, iltimos kuryerimiz bog'lanishi uchun telefon raqamingizni yuboring 📱",
                  "Sizga mos razmer aniqlandi! Qaysi rangdagi kiyimni ma'qul ko'rasiz? 👕",
                ].map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDirectMsgModal((prev) => ({ ...prev, text: tpl }))}
                    className="text-[10px] text-zinc-300 bg-black hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1 rounded-lg cursor-pointer transition-colors text-left"
                  >
                    {tpl.slice(0, 42)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Message Textarea */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300 block">Operator javobi (Bot orqali boradi):</label>
              <textarea
                rows={3}
                value={directMsgModal.text}
                onChange={(e) => setDirectMsgModal((prev) => ({ ...prev, text: e.target.value }))}
                placeholder="Mijozga bot orqali yuboriladigan javobni yozing..."
                className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-700 text-white text-xs placeholder-zinc-600 focus:border-sky-400 outline-none resize-none leading-relaxed"
              />
            </div>

            {directMsgModal.status && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  directMsgModal.status.success
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-rose-950/80 border-rose-500 text-rose-300'
                }`}
              >
                {directMsgModal.status.msg}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setDirectMsgModal({ ...directMsgModal, isOpen: false })}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold cursor-pointer transition-colors"
              >
                Yopish
              </button>
              <button
                type="button"
                disabled={directMsgModal.loading || !directMsgModal.text.trim()}
                onClick={async () => {
                  const replyText = directMsgModal.text.trim();
                  if (!replyText || !directMsgModal.customer) return;

                  setDirectMsgModal((prev) => ({ ...prev, loading: true, status: null }));
                  try {
                    const res = await sendTelegramMessage(
                      {
                        ...telegramConfig!,
                        botToken: tgToken,
                        chatId: directMsgModal.customer.chatId,
                      },
                      `👨‍💼 <b>Operator:</b>\n\n${replyText}`,
                      'HTML'
                    );
                    if (res.ok) {
                      addCustomerMessage(directMsgModal.customer.chatId, 'operator', replyText);
                      const updatedList = getStoredTelegramCustomers();
                      setTelegramCustomers(updatedList);
                      const freshCust = updatedList.find((c) => c.chatId === directMsgModal.customer!.chatId);
                      setDirectMsgModal((prev) => ({
                        ...prev,
                        customer: freshCust || prev.customer,
                        loading: false,
                        status: { success: true, msg: "Xabar mijozning botiga muvaffaqiyatli yetkazildi! ✓" },
                        text: '',
                      }));
                      setTimeout(() => {
                        setDirectMsgModal((prev) => ({ ...prev, status: null }));
                      }, 2500);
                    } else {
                      setDirectMsgModal((prev) => ({
                        ...prev,
                        loading: false,
                        status: { success: false, msg: res.error || "Xabarni yuborib bo'lmadi" },
                      }));
                    }
                  } catch (err: any) {
                    setDirectMsgModal((prev) => ({
                      ...prev,
                      loading: false,
                      status: { success: false, msg: err.message || "Xatolik yuz berdi" },
                    }));
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
              >
                <SendHorizontal className="w-3.5 h-3.5" />
                <span>{directMsgModal.loading ? "Yuborilmoqda..." : "Bot orqali Yuborish"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt zoom modal */}
      {selectedReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setSelectedReceipt(null)}
        >
          <div className="relative max-w-2xl w-full bg-zinc-900 rounded-3xl p-4 border border-zinc-700 space-y-3">
            <div className="flex justify-between items-center text-white pb-2 border-b border-zinc-800">
              <span className="font-bold text-xs font-mono">To'lov cheki rasmi</span>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-2xl bg-black flex items-center justify-center p-2">
              <img
                src={selectedReceipt}
                alt="Receipt"
                className="max-h-[70vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
      {/* Printable Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
