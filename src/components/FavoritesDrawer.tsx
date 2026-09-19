import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { formatSums } from '../data/mockData';
import { cleanText } from '../utils/cleanText';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Product[];
  onToggleFavorite: (id: string) => void;
  onAddToCart: (product: Product, size?: string) => void;
  onViewProduct: (product: Product) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onToggleFavorite,
  onAddToCart,
  onViewProduct,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between relative overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-black text-white shrink-0">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-white text-white" />
            <h3 className="font-mono font-bold text-sm tracking-wide">
              SEVIMLILAR ({favorites.length})
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

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-zinc-50/50">
          {favorites.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                <Heart className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-sm text-black">Sevimlilar ro'yxati bo'sh</h4>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                O'zingizga yoqqan kiyim va krossovkalarni yurakcha orqali saqlab qo'ying.
              </p>
            </div>
          ) : (
            favorites.map((product) => (
              <div
                key={product.id}
                className="p-3 rounded-2xl bg-white border border-zinc-200 flex items-center gap-3"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  onClick={() => {
                    onClose();
                    onViewProduct(product);
                  }}
                  className="w-16 h-16 object-contain bg-zinc-50 rounded-xl p-1 shrink-0 cursor-pointer border border-zinc-100"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase block">
                    {cleanText(product.brand)}
                  </span>
                  <h4
                    onClick={() => {
                      onClose();
                      onViewProduct(product);
                    }}
                    className="font-bold text-xs text-black truncate cursor-pointer hover:underline"
                  >
                    {cleanText(product.title)}
                  </h4>
                  <div className="font-mono text-xs font-bold text-black mt-1">
                    {formatSums(product.price)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(product.id)}
                    className="p-1 text-zinc-400 hover:text-black transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddToCart(product, product.sizes[0] || 'M')}
                    className="px-2.5 py-1.5 rounded-lg bg-black hover:bg-zinc-800 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Savatga</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
