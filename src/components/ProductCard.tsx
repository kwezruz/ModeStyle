import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../types';
import { formatSums } from '../data/mockData';
import { cleanText } from '../utils/cleanText';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  isInCart: boolean;
  onToggleFavorite: (id: string) => void;
  onAddToCart: (product: Product, size?: string, color?: string, colorImage?: string) => void;
  onViewDetails: (product: Product, color?: string, colorImage?: string) => void;
  onQuickBuy: (product: Product, size?: string, color?: string, colorImage?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite,
  isInCart,
  onToggleFavorite,
  onAddToCart,
  onViewDetails,
  onQuickBuy,
}) => {
  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || 'M');
  const colors = product.colors || [];
  const activeColor = colors[activeColorIdx];
  const activeImg = activeColor?.image || product.image;

  return (
    <div className="rounded-2xl bg-white border border-zinc-200 hover:border-black transition-all duration-200 flex flex-col justify-between group overflow-hidden p-3 sm:p-4">
      <div>
        <div className="flex items-start justify-between gap-1 mb-2">
          <div className="flex flex-wrap gap-1 items-center">
            {product.badges?.includes('original') && (
              <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-black text-white font-mono">
                ORIGINAL
              </span>
            )}
            {product.badges?.includes('xit') && (
              <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-black border border-zinc-300 font-mono">
                XIT
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product.id);
            }}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isFavorite ? 'text-black bg-zinc-100' : 'text-zinc-400 hover:text-black hover:bg-zinc-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-black' : ''}`} />
          </button>
        </div>

        {/* Product Image */}
        <div
          onClick={() => onViewDetails(product, activeColor?.name, activeImg)}
          className="w-full h-40 sm:h-52 bg-zinc-50 rounded-xl flex items-center justify-center p-3 mb-3 cursor-pointer overflow-hidden relative"
        >
          <img
            src={activeImg}
            alt={product.title}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Brand & Title */}
        <div className="space-y-1">
          <div className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
            {cleanText(product.brand)}
          </div>
          <h3
            onClick={() => onViewDetails(product, activeColor?.name, activeImg)}
            className="font-bold text-xs sm:text-sm text-black group-hover:text-zinc-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {cleanText(product.title)}
          </h3>

          {/* Colors Selection if multiple */}
          {colors.length > 0 && (
            <div className="pt-1 flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
              {colors.map((c, idx) => (
                <button
                  key={c.name}
                  type="button"
                  title={c.name}
                  onClick={() => setActiveColorIdx(idx)}
                  className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                    activeColorIdx === idx ? 'scale-125 border-black ring-1 ring-black' : 'border-zinc-300 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              <span className="text-[10px] text-zinc-500 font-medium truncate max-w-[120px]">
                {activeColor?.name}
              </span>
            </div>
          )}

          {/* Sizes */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar">
            {product.sizes.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSize(sz);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                  selectedSize === sz
                    ? 'bg-black text-white border-black'
                    : 'bg-zinc-100 text-black border-zinc-200 hover:bg-zinc-200'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>

          {/* Price */}
          <div className="pt-1 flex items-baseline gap-2 flex-wrap">
            <span className="font-mono font-black text-sm sm:text-base text-black">
              {formatSums(product.price)}
            </span>
            {product.oldPrice && (
              <span className="font-mono text-xs text-zinc-400 line-through">
                {formatSums(product.oldPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="pt-3 mt-2 border-t border-zinc-100 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onAddToCart(product, selectedSize, activeColor?.name, activeImg)}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            isInCart
              ? 'bg-zinc-200 text-black border border-black'
              : 'bg-zinc-100 hover:bg-zinc-200 text-black'
          }`}
        >
          {isInCart ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Savatda ({selectedSize})</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Savatga ({selectedSize})</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => onQuickBuy(product, selectedSize, activeColor?.name, activeImg)}
          className="py-2 px-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>Xarid</span>
        </button>
      </div>
    </div>
  );
};
