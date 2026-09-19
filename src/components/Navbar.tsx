import React from 'react';
import { Search, ShoppingBag, Heart, MessageSquare, X, User as UserIcon, LogIn, LogOut, Shield } from 'lucide-react';
import { User } from 'firebase/auth';
import { isUserAdmin } from '../firebase';

interface NavbarProps {
  cartCount: number;
  favoritesCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCart: () => void;
  onOpenFavorites: () => void;
  onOpenChat: () => void;
  currentUser: User | null;
  onLoginGoogle: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  favoritesCount,
  searchQuery,
  onSearchChange,
  onOpenCart,
  onOpenFavorites,
  onOpenChat,
  currentUser,
  onLoginGoogle,
  onOpenProfile,
}) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-2 select-none"
          title="modestyle"
        >
          <span className="text-xl sm:text-2xl font-black tracking-tighter text-black uppercase">
            modestyle
          </span>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Krossovka, hudi, futbolka qidirish..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 focus:bg-white border border-transparent focus:border-black text-xs font-medium text-black placeholder-zinc-400 outline-none transition-all"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="p-1 rounded-full text-zinc-400 hover:text-black absolute right-2.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Mobile search toggle */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden p-2 rounded-xl text-zinc-700 hover:text-black hover:bg-zinc-100 transition-colors"
            title="Qidiruv"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Google Sign In / Profile Button */}
          {currentUser ? (
            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-zinc-200 hover:border-black hover:bg-zinc-50 transition-all cursor-pointer"
              title="Profil"
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-6 h-6 rounded-full object-cover border border-zinc-300"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center">
                  {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="hidden sm:inline text-xs font-bold text-black max-w-[100px] truncate">
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onLoginGoogle}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-bold transition-all cursor-pointer border border-zinc-200"
              title="Google orqali kirish"
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
              <span className="hidden sm:inline">Google orqali kirish</span>
            </button>
          )}

          {/* Live Support Chat Button */}
          <button
            type="button"
            onClick={onOpenChat}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 hover:border-black text-xs font-bold text-black hover:bg-zinc-50 transition-all cursor-pointer"
            title="Jonli Yordam / Chat"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </button>

          {/* Favorites Button */}
          <button
            type="button"
            onClick={onOpenFavorites}
            className="relative p-2 sm:p-2.5 rounded-xl text-zinc-700 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer"
            title="Sevimlilar"
          >
            <Heart className="w-5 h-5" />
            {favoritesCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            type="button"
            onClick={onOpenCart}
            className="relative p-2 sm:p-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 transition-all cursor-pointer flex items-center gap-2"
            title="Savat"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-bold font-mono">
              {cartCount > 0 ? `${cartCount} ta` : 'Savat'}
            </span>
            {cartCount > 0 && (
              <span className="sm:hidden absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-white text-black text-[10px] font-black border border-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Dropdown Bar */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-zinc-100 bg-white animate-in slide-in-from-top-2 duration-150">
          <div className="relative flex items-center">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Krossovka yoki kiyim qidirish..."
              className="w-full pl-9 pr-9 py-2 rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-medium text-black outline-none focus:border-black"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1 rounded-full text-zinc-400 hover:text-black absolute right-2.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
