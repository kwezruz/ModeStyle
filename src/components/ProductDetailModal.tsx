import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, Check, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { formatSums } from '../data/mockData';
import { cleanText } from '../utils/cleanText';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onAddToCart: (product: Product, size: string, color?: string, colorImage?: string) => void;
  onStartCheckout: (product: Product, size: string, color?: string, colorImage?: string) => void;
  initialColor?: string;
  initialImage?: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onStartCheckout,
  initialColor,
  initialImage,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>(initialColor || product?.colors?.[0]?.name || '');
  const [selectedImage, setSelectedImage] = useState<string>(
    initialImage || product?.colors?.[0]?.image || product?.image || ''
  );
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes?.[0] || 'M');
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedColor(initialColor || product.colors?.[0]?.name || '');
      setSelectedImage(initialImage || product.colors?.[0]?.image || product.image || '');
      setSelectedSize(product.sizes?.[0] || 'M');
      setIsAdded(false);
    }
  }, [product, initialColor, initialImage]);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, selectedColor, selectedImage);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    onStartCheckout(product, selectedSize, selectedColor, selectedImage);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-2xl my-auto max-h-[92vh] flex flex-col"
      >
        <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2 truncate pr-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-black bg-zinc-100 px-2.5 py-0.5 rounded">
              {cleanText(product.brand)}
            </span>
            <span className="text-xs text-zinc-400">/</span>
            <span className="text-xs text-zinc-600 truncate">{product.categoryName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleFavorite(product.id)}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isFavorite ? 'text-black bg-zinc-100' : 'text-zinc-400 hover:text-black hover:bg-zinc-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-black' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="w-full h-64 sm:h-80 bg-zinc-50 rounded-2xl flex items-center justify-center p-4 border border-zinc-100 relative">
              <img
                src={selectedImage}
                alt={cleanText(product.title)}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-base sm:text-xl font-black text-black leading-snug">
                  {cleanText(product.title)}
                </h2>
                <div className="flex items-baseline gap-2.5 mt-2">
                  <span className="font-mono text-xl sm:text-2xl font-black text-black">
                    {formatSums(product.price)}
                  </span>
                  {product.oldPrice && (
                    <span className="font-mono text-sm text-zinc-400 line-through">
                      {formatSums(product.oldPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-black flex items-center justify-between">
                    <span>Mavjud ranglar:</span>
                    <span className="font-medium text-xs text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
                      {selectedColor || product.colors[0].name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.colors.map((c) => {
                      const isCurrent = selectedColor === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => {
                            setSelectedColor(c.name);
                            if (c.image) setSelectedImage(c.image);
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                            isCurrent
                              ? 'border-black bg-black text-white shadow-xs'
                              : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/50 shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizes */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-black flex items-center justify-between">
                  <span>O'lcham / Razmer:</span>
                  <span className="font-mono font-bold text-black bg-zinc-100 px-2 py-0.5 rounded">{selectedSize}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-10 py-1.5 px-3 rounded-xl font-mono text-xs transition-all cursor-pointer border ${
                        selectedSize === sz
                          ? 'border-black bg-black text-white font-bold'
                          : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-black'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="py-3 px-3 rounded-xl border-2 border-black hover:bg-zinc-100 text-black font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Savatda!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Savatga</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-3 px-3 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Darhol xarid</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-4">
            <h3 className="font-mono font-bold uppercase text-xs tracking-wider text-black mb-1">
              Mahsulot tavsifi:
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {cleanText(product.description)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
