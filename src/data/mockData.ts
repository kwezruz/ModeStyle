import { Product, CategoryItem, PromoCode, BannerSlide, OperatorConfig } from '../types';

export const STORE_PHONE = '+998 97 486 14 40';
export const STORE_PHONE_RAW = '+998974861440';

export const CATEGORIES: CategoryItem[] = [
  { id: 'all', slug: 'all', name: "Barcha to'plam", count: 6 },
  { id: 'sneakers', slug: 'sneakers', name: 'Krossovkalar', count: 3 },
  { id: 'hoodies', slug: 'hoodies', name: 'Hudi & Svitshot', count: 2 },
  { id: 'tshirts', slug: 'tshirts', name: 'Futbolkalar', count: 1 },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-jordan-1-retro',
    title: 'Nike Air Jordan 1 Retro High OG "Black & White"',
    category: 'sneakers',
    categoryName: 'Krossovkalar',
    brand: 'Nike Jordan',
    price: 1850000,
    oldPrice: 2200000,
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
    ],
    rating: 4.9,
    reviewsCount: 184,
    inStock: 14,
    badges: ['original', 'xit'],
    description: 'Afsonaviy Air Jordan 1 Retro High OG modeli. Tabiiy charm, Air-Sole amortizatsiyasi va kontrast monoxrom qora-oq ranglar gammasi.',
    specs: [
      { label: 'Brend', value: 'Nike Jordan' },
      { label: 'Material', value: '100% tabiiy charm' },
      { label: 'Uslub', value: 'Streetwear / Heritage' },
    ],
    colors: [
      {
        name: 'Black & White',
        hex: '#000000',
        image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Chicago Red',
        hex: '#b91c1c',
        image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'University Blue',
        hex: '#3b82f6',
        image: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&auto=format&fit=crop&q=80',
      },
    ],
    sizes: ['40', '41', '42', '43', '44'],
  },
  {
    id: 'prod-dunk-low-panda',
    title: 'Nike Dunk Low Retro "Panda" Monochrome',
    category: 'sneakers',
    categoryName: 'Krossovkalar',
    brand: 'Nike',
    price: 1290000,
    oldPrice: 1550000,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
    ],
    rating: 4.8,
    reviewsCount: 312,
    inStock: 25,
    badges: ['xit'],
    description: 'Streetwear olamidagi eng talabgir qora va oq krossovka. Har qanday libos bilan to\'liq mos tushuvchi estetika.',
    specs: [
      { label: 'Brend', value: 'Nike' },
      { label: 'Material', value: 'Premium charm' },
    ],
    colors: [
      {
        name: 'Panda Qora/Oq',
        hex: '#000000',
        image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Grey Fog Kulrang',
        hex: '#9ca3af',
        image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Triple White Oq',
        hex: '#ffffff',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
      },
    ],
    sizes: ['39', '40', '41', '42', '43', '44'],
  },
  {
    id: 'prod-adidas-samba',
    title: 'Adidas Originals Samba OG Core Black/White',
    category: 'sneakers',
    categoryName: 'Krossovkalar',
    brand: 'Adidas',
    price: 1180000,
    oldPrice: 1390000,
    image: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&auto=format&fit=crop&q=80',
    ],
    rating: 4.9,
    reviewsCount: 165,
    inStock: 19,
    badges: ['original', 'yangi'],
    description: 'Trenddagi eng mashhur klassik model. Yupqa tabiiy charm, zamsh burun va toza kauchuk taglik.',
    specs: [
      { label: 'Brend', value: 'Adidas Originals' },
      { label: 'Material', value: 'Charm va zamsh' },
    ],
    colors: [
      {
        name: 'Oq / Qora (White/Black)',
        hex: '#ffffff',
        image: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Toza Qora (Core Black)',
        hex: '#18181b',
        image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80',
      },
    ],
    sizes: ['39', '40', '41', '42', '43'],
  },
  {
    id: 'prod-modestyle-hoodie-black',
    title: 'modestyle Heavyweight 480GSM Oversize Hudi',
    category: 'hoodies',
    categoryName: 'Hudi & Svitshot',
    brand: 'modestyle',
    price: 590000,
    oldPrice: 720000,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    ],
    rating: 5.0,
    reviewsCount: 220,
    inStock: 35,
    badges: ['xit', 'yangi'],
    description: 'modestyle 480GSM og\'ir paxtali, ichi mayin nachesli qalin hudiysi. Tushirilgan yelka va zamonaviy boxy bichim.',
    specs: [
      { label: 'Brend', value: 'modestyle' },
      { label: 'Zichlik', value: '480 g/m² Heavyweight' },
      { label: 'Tarkibi', value: '100% Organik Paxta' },
    ],
    colors: [
      {
        name: 'Qora (Pitch Black)',
        hex: '#09090b',
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Qaymoqrang / Oq (Cream Oatmeal)',
        hex: '#f3f4f6',
        image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'To\'q Kulrang (Charcoal)',
        hex: '#4b5563',
        image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80',
      },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'prod-modestyle-zip-hoodie',
    title: 'modestyle Minimalist Zip-Up Street Hoodie',
    category: 'hoodies',
    categoryName: 'Hudi & Svitshot',
    brand: 'modestyle',
    price: 640000,
    oldPrice: 790000,
    image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80',
    ],
    rating: 4.8,
    reviewsCount: 88,
    inStock: 20,
    badges: ['yangi'],
    description: 'YKK metall zamokli, ikki qavatli kapyushonli va mustahkam manjetli zamonaviy zip hudi.',
    specs: [
      { label: 'Brend', value: 'modestyle' },
      { label: 'Furnitura', value: 'YKK Metal Zipper' },
    ],
    colors: [
      {
        name: 'Blackout Qora',
        hex: '#000000',
        image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Melanj Kulrang',
        hex: '#9ca3af',
        image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80',
      },
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'prod-modestyle-raw-tee',
    title: 'modestyle Vintage Heavy Cotton 260GSM Boxy Tee',
    category: 'tshirts',
    categoryName: 'Futbolkalar',
    brand: 'modestyle',
    price: 290000,
    oldPrice: 350000,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    ],
    rating: 4.9,
    reviewsCount: 145,
    inStock: 50,
    badges: ['xit'],
    description: '260GSM qalin paxtadan tikilgan Boxy-Fit futbolka. Bo\'yin qismi cho\'zilmaydi, shaklini toza saqlaydi.',
    specs: [
      { label: 'Brend', value: 'modestyle' },
      { label: 'Tarkibi', value: '100% Organik Paxta' },
    ],
    colors: [
      {
        name: 'Vintage Qora',
        hex: '#18181b',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Optik Oq',
        hex: '#ffffff',
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Zaytun Yashil (Olive)',
        hex: '#4d5d43',
        image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
      },
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
  },
];

export const INITIAL_PROMO_CODES: PromoCode[] = [
  {
    id: 'promo-1',
    code: 'MODESTYLE10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 300000,
    description: "300 000 so'mdan yuqori xaridga 10% chegirma",
    active: true,
  },
];

export const CITIES_LIST = [
  'Toshkent shahri',
  'Samarqand viloyati',
  'Buxoro viloyati',
  'Andijon viloyati',
  "Farg'ona viloyati",
  'Namangan viloyati',
  'Qashqadaryo viloyati',
  'Surxondaryo viloyati',
  'Xorazm viloyati',
  'Navoiy viloyati',
  'Jizzax viloyati',
  'Sirdaryo viloyati',
  "Qoraqalpog'iston Resp.",
];

export const PAYMENT_CARD = {
  cardNumber: '8600 4912 3456 7890',
  cardHolder: 'MODESTYLE OFFICIAL',
  bankName: 'Kapitalbank ATB (Humo / Uzcard)',
  instructions: "Buyurtma summasini kartaga o'tkazib, to'lov cheki skrinshotini yuklang.",
};

export function formatSums(amount?: number | string | null): string {
  if (amount === undefined || amount === null) return "0 so'm";
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount));
  if (isNaN(num)) return "0 so'm";
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
}

export const INITIAL_BANNERS: BannerSlide[] = [
  {
    id: 'banner-1',
    badge: "YANGI TO'PLAM 2025",
    badgeIcon: 'flame',
    title: 'PREMIUM HEAVY STREETWEAR',
    subtitle: "Og'ir 480GSM organik paxtadan tikilgan hudi va oversize svitshotlar kolleksiyasi.",
    category: 'hoodies',
    btnText: "Hudilarni ko'rish",
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&auto=format&fit=crop&q=80',
    active: true,
  },
  {
    id: 'banner-2',
    badge: 'XIT KROSSOVKALAR',
    badgeIcon: 'sparkles',
    title: 'ORIGINAL NIKE & RETRO SNEAKERS',
    subtitle: "Jordan Retro, Dunk Panda va Samba OG — 100% original sifat kafolati bilan.",
    category: 'sneakers',
    btnText: "Krossovkalarni tanlash",
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop&q=80',
    active: true,
  },
];

export const DEFAULT_OPERATOR_CONFIG: OperatorConfig = {
  name: 'Jacob',
  title: 'Rasmiy do\'kon operatori & Razmer maslahatchisi',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  welcomeMessage: "Salom! Men sizning shaxsiy maslahatchi operatoringiz Jacobman. Bo'yingiz va vazningizni aytsangiz, sizga qaysi razmer (M, L, XL, 2XL) eng ideal tushishini aniq aytib beraman!",
  sizeRules: [
    {
      id: 'rule-xs',
      size: 'XS',
      heightRange: '155 – 165 sm',
      weightRange: '45 – 53 kg',
      minHeight: 155,
      maxHeight: 165,
      minWeight: 45,
      maxWeight: 53,
      recommendationNote: "Kichik razmer, slim qomat uchun mo'ljallangan.",
      category: 'apparel',
    },
    {
      id: 'rule-s',
      size: 'S',
      heightRange: '160 – 170 sm',
      weightRange: '52 – 63 kg',
      minHeight: 160,
      maxHeight: 170,
      minWeight: 52,
      maxWeight: 63,
      recommendationNote: "Ixcham va to'g'ri bichimdagi kiyimlar uchun.",
      category: 'apparel',
    },
    {
      id: 'rule-m',
      size: 'M',
      heightRange: '168 – 176 sm',
      weightRange: '63 – 74 kg',
      minHeight: 168,
      maxHeight: 176,
      minWeight: 63,
      maxWeight: 74,
      recommendationNote: "Ommabop standart razmer, gavdaga qulay o'tiradi.",
      category: 'apparel',
    },
    {
      id: 'rule-l',
      size: 'L',
      heightRange: '174 – 182 sm',
      weightRange: '74 – 84 kg',
      minHeight: 174,
      maxHeight: 182,
      minWeight: 74,
      maxWeight: 84,
      recommendationNote: "Kengroq va qulay harakatlanish uchun.",
      category: 'apparel',
    },
    {
      id: 'rule-xl',
      size: 'XL',
      heightRange: '178 – 186 sm',
      weightRange: '83 – 92 kg',
      minHeight: 178,
      maxHeight: 186,
      minWeight: 83,
      maxWeight: 92,
      recommendationNote: "Yarim oversize yoki baquvvat qomat uchun.",
      category: 'apparel',
    },
    {
      id: 'rule-2xl',
      size: '2XL',
      heightRange: '170 – 190 sm',
      weightRange: '77 – 105 kg',
      minHeight: 170,
      maxHeight: 190,
      minWeight: 77,
      maxWeight: 105,
      recommendationNote: "170 sm va 77 kg hamda undan yuqori vaznlar uchun juda qulay oversize razmer.",
      category: 'apparel',
    },
    {
      id: 'rule-3xl',
      size: '3XL',
      heightRange: '175 – 198 sm',
      weightRange: '95 – 125 kg',
      minHeight: 175,
      maxHeight: 198,
      minWeight: 95,
      maxWeight: 125,
      recommendationNote: "Maksimal keng oversize va erkin qulaylik.",
      category: 'apparel',
    },
  ],
  templates: [
    {
      id: 'tpl-1',
      title: "Bo'y va vazn so'rash",
      template: "Assalomu alaykum! Jacobman. Bo'yingiz (sm) va vazningizni (kg) aytsangiz, sizga qaysi razmer mos kelishini darhol hisoblab beraman!",
    },
    {
      id: 'tpl-2',
      title: "2XL razmer tavsiyasi",
      template: "Sizning ko'rsatkichlaringiz (170 sm, 77 kg atrofida) uchun 2XL razmer juda yaxshi tushadi! Erkin, oversize va juda zamonaviy turadi.",
    },
    {
      id: 'tpl-3',
      title: "Yetkazib berish va to'lov",
      template: "Toshkent bo'ylab 2-4 soat ichida, viloyatlarga 1 kunda yetkazib beramiz. To'lovni karta yoki yetib borgach naqd qilish mumkin.",
    },
    {
      id: 'tpl-4',
      title: "Original sifat kafolati",
      template: "Barcha tovarlarimiz 100% original materiallardan tayyorlangan va sifatiga to'liq javob beramiz!",
    },
  ],
};
