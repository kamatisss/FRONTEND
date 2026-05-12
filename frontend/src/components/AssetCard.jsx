import React from 'react';
import { ShoppingCart, Leaf, Box, Sofa } from 'lucide-react';

const CATEGORY_ICONS = {
  plant: Leaf,
  hardscape: Box,
  furniture: Sofa,
};

const CATEGORY_COLORS = {
  plant:      'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
  hardscape:  'bg-amber-100   text-amber-600   dark:bg-amber-900/40   dark:text-amber-400',
  furniture:  'bg-sky-100     text-sky-600     dark:bg-sky-900/40     dark:text-sky-400',
};

export default function AssetCard({ product, isSelected, onClick }) {
  const CatIcon  = CATEGORY_ICONS[product.category]  || Leaf;
  const catColor = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.plant;
  const price    = Number(product.unit_price).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div
      onClick={() => onClick(product)}
      className={`
        group relative flex flex-col rounded-xl overflow-hidden cursor-pointer
        transition-all duration-300 select-none bg-white dark:bg-slate-800
        border border-slate-200 dark:border-slate-700
        ${isSelected
          ? 'ring-2 ring-emerald-500 shadow-md'
          : 'hover:shadow-md hover:border-emerald-300 hover:-translate-y-1'}
      `}
    >
      {/* ── Product Image ── */}
      <div className="relative w-full aspect-square overflow-hidden bg-slate-50 dark:bg-slate-700">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Placeholder when no thumbnail uploaded yet */
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
            <CatIcon size={36} strokeWidth={1.5} />
            <span className="text-xs">No image</span>
          </div>
        )}

        {/* Category badge */}
        <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${catColor}`}>
          {product.category}
        </span>

        {/* Selected checkmark */}
        {isSelected && (
          <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}
      </div>

      {/* ── Product Info ── */}
      <div className="flex flex-col flex-1 p-3">
        <div className="flex flex-col flex-1 min-h-[40px] justify-start mb-1">
          <p
            className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate"
            title={product.name}
          >
            {product.name}
          </p>
        </div>

        {/* Stock indicator */}
        {product.stock_quantity !== undefined && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">
            {product.stock_quantity > 0
              ? `${product.stock_quantity} left in stock`
              : 'Out of stock'}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-700/50">
          {/* Price */}
          <p className="font-bold text-emerald-600 dark:text-emerald-400 truncate pr-1">
            ₱{price}
          </p>

          {/* Call to Action Button */}
          <button
            onClick={(e) => { e.stopPropagation(); onClick(product); }}
            className={`
              shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-colors shadow-sm
              ${isSelected
                ? 'bg-emerald-500 text-white'
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:bg-slate-700 dark:text-emerald-400'}
            `}
            title={isSelected ? 'Added to Design' : 'Add to Design'}
          >
            {isSelected ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
