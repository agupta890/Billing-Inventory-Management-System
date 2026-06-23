import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FiEdit, FiTrash2, FiAlertTriangle } from 'react-icons/fi';

const ProductCard = ({ product, onEdit, onDelete }) => {
  const { user } = useContext(AuthContext);
  const isOwner = user?.role === 'owner';

  // stock indicator status
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.reorderLevel;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 group">
      
      {/* Book details */}
      <div className="space-y-3">
        {/* Category & Action Options */}
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-1 bg-slate-50 border border-slate-150 text-[10px] uppercase font-bold text-slate-500 rounded-lg">
            {product.category}
          </span>
          
          {isOwner && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button 
                onClick={() => onEdit(product)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="Edit details"
              >
                <FiEdit className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => onDelete(product._id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete product"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Thumbnail Placeholder Cover */}
        <div className="w-full h-40 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
          {product.image?.url ? (
            <img 
              src={product.image.url} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-4">
              <span className="block text-2xl font-black text-indigo-300 mb-1 leading-none">BOOK</span>
              <span className="text-[10px] text-indigo-400 uppercase font-black tracking-wider">COVER IMAGE</span>
            </div>
          )}

          {/* Alert Status Overlays */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white font-bold text-xs uppercase tracking-widest">
              Out Of Stock
            </div>
          )}
        </div>

        {/* Book Title & Author */}
        <div className="space-y-1">
          <h4 className="font-extrabold text-slate-800 text-sm leading-snug truncate" title={product.title}>
            {product.title}
          </h4>
          <p className="text-xs text-slate-400 font-semibold truncate">by {product.author}</p>
          {product.isbn && (
            <p className="text-[9px] text-slate-400 font-mono tracking-wider">ISBN: {product.isbn}</p>
          )}
        </div>
      </div>

      {/* Pricing & Stock Levels */}
      <div className="border-t border-slate-50 pt-3.5 flex items-center justify-between">
        {/* Pricing */}
        <div>
          <span className="text-[10px] text-slate-400 font-bold block leading-none">RETAIL PRICE</span>
          <span className="text-base font-extrabold text-slate-800 block mt-1">₹{product.price.toFixed(2)}</span>
          {isOwner && product.costPrice && (
            <span className="text-[9px] text-slate-400 font-medium block">Cost: ₹{product.costPrice.toFixed(2)}</span>
          )}
        </div>

        {/* Stock Level Indicator */}
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold block leading-none">STOCK LEVEL</span>
          <span className={`text-xs font-black block mt-1 ${
            isOutOfStock 
              ? 'text-slate-800' 
              : isLowStock 
              ? 'text-rose-500' 
              : 'text-emerald-500'
          }`}>
            {product.stock} units
          </span>

          {/* Low Stock Warn Badge */}
          {isLowStock && (
            <span className="inline-flex items-center gap-0.5 mt-1 text-[8px] font-extrabold text-rose-500 uppercase">
              <FiAlertTriangle className="w-2 h-2" />
              <span>Low</span>
            </span>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
