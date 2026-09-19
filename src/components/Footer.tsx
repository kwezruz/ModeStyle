import React, { useRef } from 'react';
import { PhoneCall, ShieldCheck, RotateCcw, Clock, Bot, Send, Instagram } from 'lucide-react';
import { STORE_PHONE, STORE_PHONE_RAW } from '../data/mockData';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
  onGoToAdmin?: () => void;
  onOpenChat: () => void;
  telegramBotUsername?: string;
  telegramChannel?: string;
  instagramProfile?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onGoToAdmin,
  onOpenChat,
  telegramBotUsername = 'Modestyleuzbot',
  telegramChannel = 'https://t.me/modestyle_uz',
  instagramProfile = 'https://instagram.com/modestyle.uz',
}) => {
  const botCleanUsername = telegramBotUsername.replace(/^@/, '');
  const botUrl = `https://t.me/${botCleanUsername}`;
  const channelUrl = telegramChannel.startsWith('http') ? telegramChannel : `https://t.me/${telegramChannel.replace(/^@/, '')}`;
  const instagramUrl = instagramProfile.startsWith('http') ? instagramProfile : `https://instagram.com/${instagramProfile.replace(/^@/, '')}`;

  return (
    <footer className="w-full bg-black text-white pt-12 pb-24 md:pb-12 border-t border-zinc-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-white uppercase">
              modestyle
            </span>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-xs">
              Zamonaviy streetwear kiyimlar va original krossovkalar do'koni. Rasmiy Telegram botimiz orqali buyurtma bering.
            </p>
            <div className="flex items-center gap-2 pt-1 text-zinc-300 font-mono">
              <PhoneCall className="w-4 h-4 text-white" />
              <a href={`tel:${STORE_PHONE_RAW}`} className="hover:underline font-bold text-sm">
                {STORE_PHONE}
              </a>
            </div>

            {/* Social badges */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href={botUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30 font-bold text-[11px] transition-colors"
                title="Telegram Bot"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>@{botCleanUsername}</span>
              </a>
              <a
                href={channelUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                title="Telegram Kanal"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-pink-400 hover:text-pink-300 border border-zinc-800 transition-colors"
                title="Instagram Sahifa"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-mono font-bold text-white uppercase text-xs tracking-wider">
              Kolleksiyalar
            </h4>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('sneakers')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Krossovkalar
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('hoodies')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Hudi & Svitshotlar
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('tshirts')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Futbolkalar
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-mono font-bold text-white uppercase text-xs tracking-wider">
              Kafolatlar
            </h4>
            <div className="space-y-2 text-zinc-400">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span>100% sifat kafolati</span>
              </div>
              <div className="flex items-start gap-2">
                <RotateCcw className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span>Razmer to'g'ri kelmasa bepul almashtirish</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span>Tezkor yetkazib berish</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-mono font-bold text-white uppercase text-xs tracking-wider">
              Mijozlar xizmati
            </h4>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Google orqali kiring va xaridlaringiz holatini istalgan payt ko'ring.
            </p>
            <button
              type="button"
              onClick={onOpenChat}
              className="mt-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition-colors border border-zinc-800 cursor-pointer"
            >
              Jonli yordamni ochish
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-zinc-500 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} modestyle. Barcha huquqlar himoyalangan.
          </div>
          <div className="flex items-center gap-3">
            <span>Toshkent, O'zbekiston</span>
            {onGoToAdmin && (
              <button
                type="button"
                onClick={onGoToAdmin}
                className="text-zinc-600 hover:text-zinc-400 transition-colors text-[11px] cursor-pointer"
              >
                Admin Kirish
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
