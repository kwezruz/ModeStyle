import React from 'react';
import { Home, LayoutGrid, Heart, ShoppingBag, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';

interface MobileBottomNavProps {
  onHomeClick: () => void;
  onOpenCategories: () => void;
  onOpenFavorites: () => void;
  onOpenCart: () => void;
  onOpenProfile: () => void;
  onLoginGoogle: () => void;
  currentUser: User | null;
  favoritesCount: number;
  cartCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onHomeClick,
  onOpenCategories,
  onOpenFavorites,
  onOpenCart,
  onOpenProfile,
  onLoginGoogle,
  currentUser,
  favoritesCount,
  cartCount,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-3 py-2 flex items-center justify-around shadow-2xl safe-area-bottom">
      <button
        type="button"
        onClick={onHomeClick}
        className="flex flex-col items-center gap-0.5 text-zinc-600 hover:text-black transition-colors p-1 cursor-pointer"
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold">Asosiy</span>
      </button>

      <button
        type="button"
        onClick={onOpenCategories}
        className="flex flex-col items-center gap-0.5 text-zinc-600 hover:text-black transition-colors p-1 cursor-pointer"
      >
        <LayoutGrid className="w-5 h-5" />
        <span className="text-[10px] font-bold">Katalog</span>
      </button>

      <button
        type="button"
        onClick={onOpenFavorites}
        className="flex flex-col items-center gap-0.5 text-zinc-600 hover:text-black transition-colors p-1 relative cursor-pointer"
      >
        <Heart className="w-5 h-5" />
        {favoritesCount > 0 && (
          <span className="absolute top-0 right-1 min-w-4 h-4 px-1 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center">
            {favoritesCount}
          </span>
        )}
        <span className="text-[10px] font-bold">Sevimlilar</span>
      </button>

      <button
        type="button"
        onClick={onOpenCart}
        className="flex flex-col items-center gap-0.5 text-zinc-600 hover:text-black transition-colors p-1 relative cursor-pointer"
      >
        <ShoppingBag className="w-5 h-5" />
        {cartCount > 0 && (
          <span className="absolute top-0 right-1 min-w-4 h-4 px-1 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center">
            {cartCount}
          </span>
        )}
        <span className="text-[10px] font-bold">Savat</span>
      </button>

      {currentUser ? (
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex flex-col items-center gap-0.5 text-black p-1 cursor-pointer"
        >
          {currentUser.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt=""
              className="w-5 h-5 rounded-full object-cover border border-black"
            />
          ) : (
            <UserIcon className="w-5 h-5" />
          )}
          <span className="text-[10px] font-bold">Profil</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onLoginGoogle}
          className="flex flex-col items-center gap-0.5 text-zinc-600 hover:text-black p-1 cursor-pointer"
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold">Kirish</span>
        </button>
      )}
    </div>
  );
};
