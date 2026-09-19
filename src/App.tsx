import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, loginWithGoogle, logoutUser, testFirestoreConnection } from './firebase';
import {
  CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_PROMO_CODES,
  INITIAL_BANNERS,
  PAYMENT_CARD,
  DEFAULT_OPERATOR_CONFIG,
} from './data/mockData';
import {
  Product,
  CartItem,
  Order,
  PromoCode,
  BannerSlide,
  UserProfile,
  PaymentCardConfig,
  ChatMessage,
  OperatorConfig,
  SizeRuleConfig,
  TelegramBotConfig,
} from './types';
import {
  DEFAULT_TELEGRAM_CONFIG,
  notifyNewOrderToTelegram,
  notifyCustomerChatToTelegram,
  processTelegramBotUpdates,
} from './services/telegramService';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoriesFilter } from './components/CategoriesFilter';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { LiveChat } from './components/LiveChat';
import { AdminPortal } from './components/AdminPortal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { UserProfileModal } from './components/UserProfileModal';
import { SlidersHorizontal, PackageX, LogIn, CheckCircle2, Bot, Send, Instagram, ArrowRight } from 'lucide-react';
import { cleanText } from './utils/cleanText';
import { generateDefaultSizeGuides } from './utils/sizeCalculator';

const sanitizeProduct = (p: Product): Product => {
  const sizes = p.sizes || [];
  const sizeGuides = p.sizeGuides && p.sizeGuides.length > 0
    ? p.sizeGuides
    : generateDefaultSizeGuides(p.category, sizes);
  return {
    ...p,
    title: cleanText(p.title),
    brand: cleanText(p.brand),
    description: cleanText(p.description),
    specs: p.specs?.map((s) => ({
      label: cleanText(s.label),
      value: cleanText(s.value),
    })),
    sizes,
    sizeGuides,
  };
};

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authToast, setAuthToast] = useState<string | null>(null);

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('modestyle_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(sanitizeProduct);
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PRODUCTS.map(sanitizeProduct);
  });

  useEffect(() => {
    try {
      localStorage.setItem('modestyle_products', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('modestyle_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('modestyle_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  // Firebase Auth listener & DB sync
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);

      if (user) {
        // Save user profile to Firestore
        try {
          const userRef = doc(db, 'users', user.uid);
          const profileData: UserProfile = {
            id: user.uid,
            name: user.displayName || 'Mijoz',
            email: user.email || '',
            photoURL: user.photoURL || undefined,
            createdAt: new Date().toISOString(),
          };
          await setDoc(userRef, profileData, { merge: true });
        } catch (err) {
          console.warn('Firestore profile sync error (transient offline):', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('modestyle_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((it: CartItem) => ({
            ...it,
            product: sanitizeProduct(it.product),
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('modestyle_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('modestyle_favorites');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('modestyle_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  // Promocodes & Banners & Card
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    try {
      const saved = localStorage.getItem('modestyle_promos');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROMO_CODES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('modestyle_promos', JSON.stringify(promoCodes));
    } catch (e) {
      console.error(e);
    }
  }, [promoCodes]);

  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  const [banners, setBanners] = useState<BannerSlide[]>(() => {
    try {
      const saved = localStorage.getItem('modestyle_banners');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BANNERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('modestyle_banners', JSON.stringify(banners));
    } catch (e) {
      console.error(e);
    }
  }, [banners]);

  const [paymentCard, setPaymentCard] = useState<PaymentCardConfig>(() => {
    try {
      const saved = localStorage.getItem('modestyle_payment_card');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return PAYMENT_CARD;
  });

  useEffect(() => {
    try {
      localStorage.setItem('modestyle_payment_card', JSON.stringify(paymentCard));
    } catch (e) {
      console.error(e);
    }
  }, [paymentCard]);

  // Operator Jacob config & dynamic size rules
  const [operatorConfig, setOperatorConfig] = useState<OperatorConfig>(() => {
    try {
      const saved = localStorage.getItem('modestyle_operator_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_OPERATOR_CONFIG;
  });

  useEffect(() => {
    try {
      localStorage.setItem('modestyle_operator_config', JSON.stringify(operatorConfig));
    } catch (e) {
      console.error(e);
    }
  }, [operatorConfig]);

  // Telegram Bot integration config
  const [telegramConfig, setTelegramConfig] = useState<TelegramBotConfig>(() => {
    try {
      const saved = localStorage.getItem('modestyle_telegram_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_TELEGRAM_CONFIG, ...parsed };
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_TELEGRAM_CONFIG;
  });

  useEffect(() => {
    try {
      localStorage.setItem('modestyle_telegram_config', JSON.stringify(telegramConfig));
    } catch (e) {
      console.error(e);
    }
  }, [telegramConfig]);

  // Periodic bot update processor to respond to admin's Telegram commands (/status, /orders, etc.)
  useEffect(() => {
    if (!telegramConfig.enabled || !telegramConfig.botToken.trim()) return;

    // Initial check
    processTelegramBotUpdates(telegramConfig, orders, products.length).catch(console.error);

    const interval = setInterval(() => {
      processTelegramBotUpdates(telegramConfig, orders, products.length).catch(console.error);
    }, 7000);

    return () => clearInterval(interval);
  }, [telegramConfig, orders, products.length]);

  // Live Chat messages (shared between customer LiveChat and Admin panel)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('modestyle_chat_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: '1',
        sender: 'assistant',
        text: `Salom! Men rasmiy do'kon operatoringiz ${DEFAULT_OPERATOR_CONFIG.name}man. Bo'yingiz va vazningizni aytsangiz (masalan: 170 sm, 77 kg), sizga qaysi razmer eng ideal tushishini aniq hisoblab beraman!`,
        time: '10:00',
        timestamp: Date.now(),
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('modestyle_chat_messages', JSON.stringify(chatMessages));
    } catch (e) {
      console.error(e);
    }
  }, [chatMessages]);

  // Intelligent parser for height and weight in text
  const parseHeightAndWeight = (str: string) => {
    const text = str.toLowerCase();
    let height: number | null = null;
    let weight: number | null = null;

    // Pattern 1: 170 sm, 77 kg
    const hMatch = text.match(/(\d{2,3})\s*(?:sm|cm|metr|m\b)/);
    if (hMatch) height = parseInt(hMatch[1]);

    const wMatch = text.match(/(\d{2,3})\s*(?:kg|kilo|kilogram)/);
    if (wMatch) weight = parseInt(wMatch[1]);

    // Pattern 2: raw numbers e.g. "170 77" or "170 sm 77"
    if (!height || !weight) {
      const nums = text.match(/\b\d{2,3}\b/g);
      if (nums && nums.length >= 2) {
        const n1 = parseInt(nums[0]);
        const n2 = parseInt(nums[1]);
        if (n1 >= 140 && n1 <= 220 && n2 >= 40 && n2 <= 160) {
          height = n1;
          weight = n2;
        } else if (n2 >= 140 && n2 <= 220 && n1 >= 40 && n1 <= 160) {
          height = n2;
          weight = n1;
        }
      }
    }

    return { height, weight };
  };

  const handleSendMessage = (text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      time,
      timestamp: Date.now(),
      userName: currentUser?.displayName || currentUser?.email || 'Mijoz',
      userEmail: currentUser?.email || undefined,
    };
    setChatMessages((prev) => [...prev, userMsg]);

    // Notify admin via Telegram bot
    notifyCustomerChatToTelegram(
      telegramConfig,
      text,
      currentUser?.displayName || currentUser?.email || 'Saytdagi mijoz'
    ).catch(console.error);

    // Operator Jacob dynamic auto-reply
    setTimeout(() => {
      const q = text.toLowerCase();
      const opName = operatorConfig.name || 'Jacob';
      let reply = `Assalomu alaykum! Men sizning operatoringiz ${opName}man. Sizga qanday yordam bera olaman?`;

      // 1. Check if user provided height and weight (e.g. 170 sm, 77 kg)
      const { height, weight } = parseHeightAndWeight(text);

      if (height && weight) {
        // Find best matching size rule from operatorConfig.sizeRules
        const rules = operatorConfig.sizeRules || [];
        let matchedRule: SizeRuleConfig | undefined = undefined;

        // Try exact range match
        matchedRule = rules.find((r) => {
          const inH = height >= (r.minHeight - 2) && height <= (r.maxHeight + 2);
          const inW = weight >= (r.minWeight - 2) && weight <= (r.maxWeight + 2);
          return inH && inW;
        });

        // Fallback: weight-centric heuristic
        if (!matchedRule) {
          matchedRule = rules.find((r) => weight >= r.minWeight && weight <= r.maxWeight);
        }

        if (!matchedRule) {
          if (weight >= 95 || height >= 188) {
            matchedRule = rules.find((r) => r.size === '3XL' || r.size === '2XL');
          } else if (weight >= 75) {
            matchedRule = rules.find((r) => r.size === '2XL' || r.size === 'XL');
          } else if (weight >= 65) {
            matchedRule = rules.find((r) => r.size === 'L' || r.size === 'M');
          } else {
            matchedRule = rules.find((r) => r.size === 'S' || r.size === 'XS');
          }
        }

        if (matchedRule) {
          reply = `Siz kiritgan parametrlar: ${height} sm bo'y va ${weight} kg vazn.\n\n🎯 Tavsiya etilgan razmer: 【 ${matchedRule.size} 】\n📏 Razmer parametrlari: ${matchedRule.heightRange} | ${matchedRule.weightRange}\n💡 Izoh: ${matchedRule.recommendationNote}\n\nKiyimlarni bemalol ${matchedRule.size} razmerda tanlashingiz mumkin!`;
        } else {
          reply = `Siz kiritgan parametrlar (${height} sm, ${weight} kg) uchun eng qulay tanlov: 2XL yoki XL razmer. Agar oversize yoqtirsangiz 2XL eng ideal variant!`;
        }
      } else if (q.includes('2xl') || (q.includes('170') && q.includes('77'))) {
        reply = `Aynan 170 sm bo'y va 77 kg vazn uchun do'konimizdagi 【 2XL 】 razmer juda qulay va chiroyli oversize tushadi! Erkin harakatlanish uchun eng to'g'ri tanlov.`;
      } else if (q.includes('razmer') || q.includes('o\'lcham') || q.includes('olcham')) {
        reply = `Assalomu alaykum! Men ${opName}man. Sizga to'g'ri razmerni aytib berishim uchun bo'yingiz (sm) va vazningizni (kg) yozib yuboring (masalan: 170 sm, 77 kg).`;
      } else if (q.includes('google') || q.includes('registrats') || q.includes('kirish') || q.includes('profil')) {
        reply = `Tepada o'ng tomondagi "Google orqali kirish" tugmasini bosib bir necha soniyada kirsangiz, barcha buyurtmalaringiz profilingizda saqlanadi!`;
      } else if (q.includes('tolov') || q.includes('karta') || q.includes('pul') || q.includes('narx')) {
        reply = `To'lov Humo yoki Uzcard orqali amalga oshiriladi. Chek yuklangach, operator ${opName} tekshirib darhol tasdiqlaydi.`;
      } else if (q.includes('yetkazib') || q.includes('dostavka') || q.includes('vaqt')) {
        reply = `Toshkent bo'yicha 2-4 soat ichida yetkazib beramiz. Viloyatlarga BTS yoki O'zbekiston pochtasi orqali 1-2 kunda yetib boradi.`;
      } else {
        reply = `Savolingiz qabul qilindi! Men operator ${opName}man. Agar razmer bo'yicha maslahat kerak bo'lsa, bemalol bo'yingiz va vazningizni ayting.`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now() + 1,
        },
      ]);
    }, 600);
  };

  const handleSendAdminMessage = (text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const adminMsg: ChatMessage = {
      id: `admin-msg-${Date.now()}`,
      sender: 'assistant',
      text,
      time,
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev, adminMsg]);
  };

  const handleClearChat = () => {
    const opName = operatorConfig.name || 'Jacob';
    setChatMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `Assalomu alaykum! Men rasmiy operator ${opName}man. Sizga razmer tanlash yoki buyurtma bo'yicha qanday yordam bera olaman?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
      },
    ]);
  };

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating'>('popular');

  // Modal views
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalInitialColor, setModalInitialColor] = useState<string | undefined>(undefined);
  const [modalInitialImage, setModalInitialImage] = useState<string | undefined>(undefined);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Dedicated View routing: 'store' or 'admin'
  const [currentView, setCurrentView] = useState<'store' | 'admin'>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#admin') {
      return 'admin';
    }
    return 'store';
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentView('admin');
      } else if (window.location.hash === '' || window.location.hash === '#store') {
        setCurrentView('store');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLoginGoogle = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        setAuthToast(`Xush kelibsiz, ${user.displayName || user.email}!`);
        setTimeout(() => setAuthToast(null), 3500);
      }
    } catch (err: any) {
      console.error('Google login failed:', err);
      // Popup closed or blocked
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsProfileOpen(false);
      setAuthToast("Tizimdan muvaffaqiyatli chiqildi");
      setTimeout(() => setAuthToast(null), 3000);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchCategory = p.categoryName.toLowerCase().includes(q);
          if (!matchTitle && !matchBrand && !matchCategory) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Cart operations
  const handleAddToCart = (
    product: Product,
    size: string = product.sizes[0] || 'M',
    color?: string,
    colorImage?: string
  ) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) =>
          it.product.id === product.id &&
          it.selectedSize === size &&
          it.selectedColor === color
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + 1,
        };
        return updated;
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          selectedSize: size,
          selectedColor: color,
          selectedColorImage: colorImage,
        },
      ];
    });
  };

  const handleQuickBuy = (
    product: Product,
    size: string = product.sizes[0] || 'M',
    color?: string,
    colorImage?: string
  ) => {
    handleAddToCart(product, size, color, colorImage);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (
    productId: string,
    size: string,
    delta: number,
    color?: string
  ) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (
            item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor === color
          ) {
            const nextQ = item.quantity + delta;
            return nextQ > 0 ? { ...item, quantity: nextQ } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string, size: string, color?: string) => {
    setCartItems((prev) =>
      prev.filter(
        (it) =>
          !(
            it.product.id === productId &&
            it.selectedSize === size &&
            it.selectedColor === color
          )
      )
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleToggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleOrderCreated = async (order: Order) => {
    const enrichedOrder: Order = {
      ...order,
      userId: currentUser?.uid || order.userId,
      email: currentUser?.email || order.email,
    };
    setOrders((prev) => [enrichedOrder, ...prev]);
    setCartItems([]);
    setAppliedPromo(null);

    // Sync order to Firestore
    try {
      const orderRef = doc(db, 'orders', enrichedOrder.id);
      await setDoc(orderRef, enrichedOrder);
    } catch (err) {
      console.warn('Firestore order sync error (transient offline):', err);
    }

    // Send instant notification to Telegram Bot
    notifyNewOrderToTelegram(telegramConfig, enrichedOrder).catch((err) => {
      console.error('Failed to notify Telegram about order:', err);
    });
  };

  const favoriteProducts = useMemo(() => {
    return products.filter((p) => favorites.includes(p.id));
  }, [products, favorites]);

  if (currentView === 'admin') {
    return (
      <AdminPortal
        orders={orders}
        onUpdateOrder={(upOrder) => {
          setOrders((prev) => prev.map((o) => (o.id === upOrder.id ? upOrder : o)));
        }}
        products={products}
        onAddProduct={(newProd) => {
          setProducts((prev) => [sanitizeProduct(newProd), ...prev]);
        }}
        onUpdateProduct={(upProd) => {
          setProducts((prev) => prev.map((p) => (p.id === upProd.id ? sanitizeProduct(upProd) : p)));
        }}
        onDeleteProduct={(id) => {
          setProducts((prev) => prev.filter((p) => p.id !== id));
        }}
        banners={banners}
        onUpdateBanners={setBanners}
        paymentCard={paymentCard}
        onUpdatePaymentCard={setPaymentCard}
        promoCodes={promoCodes}
        onUpdatePromoCodes={setPromoCodes}
        chatMessages={chatMessages}
        onSendAdminMessage={handleSendAdminMessage}
        onClearChat={handleClearChat}
        operatorConfig={operatorConfig}
        onUpdateOperatorConfig={setOperatorConfig}
        telegramConfig={telegramConfig}
        onUpdateTelegramConfig={setTelegramConfig}
        currentUser={currentUser}
        onLoginGoogle={handleLoginGoogle}
        onLogout={handleLogout}
        onBackToStore={() => {
          setCurrentView('store');
          window.location.hash = '';
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black selection:bg-black selection:text-white font-sans">
      {/* Toast notification */}
      {authToast && (
        <div className="fixed top-4 right-4 z-50 bg-black text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{authToast}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        favoritesCount={favorites.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        currentUser={currentUser}
        onLoginGoogle={handleLoginGoogle}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Categories Filter */}
      <CategoriesFilter
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={(slug) => setSelectedCategory(slug)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 pb-24 md:pb-12 space-y-6">
        {/* Banner */}
        <HeroBanner
          banners={banners}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            window.scrollTo({ top: 350, behavior: 'smooth' });
          }}
        />

        {/* Google sign in promotion banner if not logged in */}
        {!currentUser && (
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-black">
                  Google akkauntingiz bilan bir bosishda kiring
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Buyurtmalaringiz, to'lov cheklari va sevimlilar ro'yxati profilingizda doimiy saqlanadi.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLoginGoogle}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-sm"
            >
              <span>Google orqali ro'yxatdan o'tish</span>
            </button>
          </div>
        )}

        {/* Catalog Header & Sort Options */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight font-display">
              {selectedCategory === 'all'
                ? 'Barcha Mahsulotlar'
                : CATEGORIES.find((c) => c.slug === selectedCategory)?.name || 'Katalog'}
            </h2>
            <span className="text-xs font-mono font-bold bg-zinc-100 text-black px-2.5 py-0.5 rounded-full border border-zinc-200">
              {filteredProducts.length} ta
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-medium text-black outline-none cursor-pointer text-xs"
              >
                <option value="popular">Ommabopligi bo'yicha</option>
                <option value="price-asc">Narxi: Arzondan qimmatga</option>
                <option value="price-desc">Narxi: Qimmatdan arzonga</option>
                <option value="rating">Reytingi bo'yicha</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-zinc-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center mx-auto text-zinc-500">
              <PackageX className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-black">Mahsulot topilmadi</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Qidiruv so'rovi yoki tanlangan kategoriya bo'yicha tovarlar mavjud emas.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Filtrlarni tozalash
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                isFavorite={favorites.includes(prod.id)}
                isInCart={cartItems.some((i) => i.product.id === prod.id)}
                onToggleFavorite={handleToggleFavorite}
                onAddToCart={handleAddToCart}
                onViewDetails={(p, col, img) => {
                  setSelectedProduct(p);
                  setModalInitialColor(col);
                  setModalInitialImage(img);
                }}
                onQuickBuy={handleQuickBuy}
              />
            ))}
          </div>
        )}

        {/* Telegram Bot & Socials Marketing Banner */}
        <section className="mt-8 p-6 sm:p-8 rounded-3xl bg-zinc-950 text-white border border-zinc-800 relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold border border-sky-500/30">
                <Bot className="w-3.5 h-3.5" />
                <span>Rasmiy Telegram Botimiz ishga tushdi</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white font-display">
                Do'konimizni Telegramda ham kuzating! 🛍
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl">
                Yangi kelgan tovarlar, tezkor buyurtma berish va maxsus chegirmalardan birinchilardan bo'lib xabardor bo'ling. Tez kunda rasmiy Telegram kanalimiz va Instagram sahifamiz ham ochiladi!
              </p>
              <div className="flex flex-wrap gap-2.5 pt-2">
                <a
                  href={`https://t.me/${(telegramConfig.botUsername || 'Modestyleuzbot').replace(/^@/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-black text-xs transition-all shadow-md"
                >
                  <Bot className="w-4 h-4" />
                  <span>@{telegramConfig.botUsername || 'Modestyleuzbot'} ga kirish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href={
                    telegramConfig.telegramChannel?.startsWith('http')
                      ? telegramConfig.telegramChannel
                      : `https://t.me/${(telegramConfig.telegramChannel || 'modestyle_uz').replace(/^@/, '')}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold text-xs border border-zinc-700 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-sky-400" />
                  <span>Telegram Kanal</span>
                </a>
                <a
                  href={
                    telegramConfig.instagramProfile?.startsWith('http')
                      ? telegramConfig.instagramProfile
                      : `https://instagram.com/${(telegramConfig.instagramProfile || 'modestyle.uz').replace(/^@/, '')}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold text-xs border border-zinc-700 transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  <span>Instagram Sahifa</span>
                </a>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-amber-400 text-xs">
                <span>⚡️ Jacob bilan tezkor maslahat:</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Bo'y va vazningizga qarab aniq razmer tanlashda (masalan: 170 sm va 77 kg uchun 2XL) va to'lov masalalarida operatorimiz doim yordam beradi.
              </p>
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs text-center transition-colors cursor-pointer shadow-sm"
              >
                Operator bilan suhbatlashish
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          window.scrollTo({ top: 350, behavior: 'smooth' });
        }}
        onGoToAdmin={() => {
          setCurrentView('admin');
          window.location.hash = 'admin';
        }}
        onOpenChat={() => setIsChatOpen(true)}
        telegramBotUsername={telegramConfig.botUsername}
        telegramChannel={telegramConfig.telegramChannel}
        instagramProfile={telegramConfig.instagramProfile}
      />

      {/* Mobile Bottom Bar */}
      <MobileBottomNav
        onHomeClick={() => {
          setSelectedCategory('all');
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCategories={() => {
          window.scrollTo({ top: 250, behavior: 'smooth' });
        }}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLoginGoogle={handleLoginGoogle}
        currentUser={currentUser}
        favoritesCount={favorites.length}
        cartCount={cartItems.reduce((s, i) => s + i.quantity, 0)}
      />

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => {
          setSelectedProduct(null);
          setModalInitialColor(undefined);
          setModalInitialImage(undefined);
        }}
        initialColor={modalInitialColor}
        initialImage={modalInitialImage}
        isFavorite={selectedProduct ? favorites.includes(selectedProduct.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onAddToCart={handleAddToCart}
        onStartCheckout={(p, size, color, colorImg) => {
          handleAddToCart(p, size, color, colorImg);
          setSelectedProduct(null);
          setModalInitialColor(undefined);
          setModalInitialImage(undefined);
          setIsCheckoutOpen(true);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        promoCodes={promoCodes}
        appliedPromo={appliedPromo}
        onApplyPromo={setAppliedPromo}
      />

      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favoriteProducts}
        onToggleFavorite={handleToggleFavorite}
        onAddToCart={handleAddToCart}
        onViewProduct={(p) => setSelectedProduct(p)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        promo={appliedPromo}
        onOrderCreated={handleOrderCreated}
        currentUser={currentUser}
        onLoginGoogle={handleLoginGoogle}
        paymentCard={paymentCard}
      />

      <LiveChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        currentUser={currentUser}
        operator={operatorConfig}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        orders={orders}
        onGoToAdmin={() => {
          setIsProfileOpen(false);
          setCurrentView('admin');
          window.location.hash = 'admin';
        }}
      />
    </div>
  );
}
