export interface ProductColor {
  name: string;
  hex: string;
  image?: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface SizeGuideItem {
  size: string;
  heightRange?: string;
  weightRange?: string;
  minHeight?: number;
  maxHeight?: number;
  minWeight?: number;
  maxWeight?: number;
  footLength?: string;
  note?: string;
}

export interface Product {
  id: string;
  title: string;
  category: string;
  categoryName: string;
  brand: string;
  price: number;
  oldPrice?: number;
  image: string;
  gallery?: string[];
  rating: number;
  reviewsCount: number;
  inStock: number;
  badges?: string[];
  description: string;
  specs: ProductSpec[];
  colors?: ProductColor[];
  sizes: string[];
  sizeGuides?: SizeGuideItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor?: string;
  selectedColorImage?: string;
}

export type PaymentMethod = 'card' | 'cash';
export type PaymentStatus = 'receipt_submitted' | 'paid' | 'rejected' | 'cash_on_delivery';

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  email?: string;
  phone: string;
  city: string;
  address: string;
  deliveryMethod: 'courier' | 'pickup';
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  receiptImage?: string;
  receiptUploadedAt?: string;
  orderStatus: 'new' | 'processing' | 'shipped' | 'delivered';
  items: CartItem[];
  createdAt: string;
  notes?: string;
  promoCode?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  description: string;
  active: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  phone?: string;
  city?: string;
  address?: string;
  createdAt?: string;
}

export interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  count: number;
}

export interface BannerSlide {
  id: string;
  badge: string;
  badgeIcon: 'sparkles' | 'flame' | 'tag';
  title: string;
  subtitle: string;
  category: string;
  btnText: string;
  image: string;
  active?: boolean;
}

export interface PaymentCardConfig {
  cardNumber: string;
  cardHolder: string;
  bankName: string;
  instructions: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'admin';
  text: string;
  time: string;
  timestamp?: number;
  userName?: string;
  userEmail?: string;
}

export interface SizeRuleConfig {
  id: string;
  size: string; // e.g. '2XL', 'XL', 'L', 'M', 'S'
  heightRange: string; // e.g. "170 – 178 sm"
  weightRange: string; // e.g. "77 – 85 kg"
  minHeight: number;
  maxHeight: number;
  minWeight: number;
  maxWeight: number;
  recommendationNote: string;
  category?: 'apparel' | 'shoes';
}

export interface ChatTemplate {
  id: string;
  title: string;
  template: string;
}

export interface OperatorConfig {
  name: string; // 'Jacob'
  title: string; // 'Rasmiy do\'kon operatori'
  avatarUrl: string;
  welcomeMessage: string;
  sizeRules: SizeRuleConfig[];
  templates: ChatTemplate[];
}

export interface TelegramBotConfig {
  botToken: string;
  chatId: string;
  botUsername?: string;
  enabled: boolean;
  notifyOrders: boolean;
  notifyChat: boolean;
  telegramChannel?: string;
  instagramProfile?: string;
  adminUsername?: string;
  storeWebsiteUrl?: string;
  welcomePromoText?: string;
  adminPin?: string;
}

export interface TelegramChatMessage {
  id: string;
  sender: 'customer' | 'operator';
  text: string;
  timestamp: string;
}

export interface TelegramCustomerProfile {
  chatId: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  location?: {
    latitude: number;
    longitude: number;
    googleMapUrl: string;
    yandexMapUrl: string;
  };
  addressText?: string;
  messages?: TelegramChatMessage[];
  registeredAt: string;
  lastActive: string;
}


