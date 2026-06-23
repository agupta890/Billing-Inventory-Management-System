import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProductFormModal = ({ isOpen, onClose, onSubmit, editingProduct }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    description: '',
    price: '',
    costPrice: '',
    stock: '0',
    supplier: '',
    reorderLevel: '10',
    status: 'active',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        title: editingProduct.title || '',
        author: editingProduct.author || '',
        isbn: editingProduct.isbn || '',
        category: editingProduct.category || '',
        description: editingProduct.description || '',
        price: editingProduct.price?.toString() || '',
        costPrice: editingProduct.costPrice?.toString() || '',
        stock: editingProduct.stock?.toString() || '0',
        supplier: editingProduct.supplier || '',
        reorderLevel: editingProduct.reorderLevel?.toString() || '10',
        status: editingProduct.status || 'active',
        imageUrl: editingProduct.image?.url || '',
      });
    } else {
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category: 'Fiction',
        description: '',
        price: '',
        costPrice: '',
        stock: '0',
        supplier: '',
        reorderLevel: '10',
        status: 'active',
        imageUrl: '',
      });
    }
  }, [editingProduct, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.category || !formData.price) {
      return toast.error('Title, author, category, and retail price are required');
    }

    const payload = {
      title: formData.title,
      author: formData.author,
      isbn: formData.isbn,
      category: formData.category,
      description: formData.description,
      price: Number(formData.price),
      costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
      stock: Number(formData.stock),
      supplier: formData.supplier,
      reorderLevel: Number(formData.reorderLevel),
      status: formData.status,
      image: {
        public_id: '',
        url: formData.imageUrl || '',
      },
    };

    setLoading(true);
    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-extrabold text-slate-800 text-lg">
            {editingProduct ? 'Edit Book Details' : 'Add New Book'}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Book Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. The Hobbit"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Author *
              </label>
              <input
                type="text"
                name="author"
                required
                value={formData.author}
                onChange={handleChange}
                placeholder="e.g. J.R.R. Tolkien"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
              />
            </div>

            {/* ISBN */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                ISBN Code
              </label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                placeholder="e.g. 9780261102217"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
              >
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Academic">Academic</option>
                <option value="Science">Science</option>
                <option value="Biography">Biography</option>
                <option value="Children">Children</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Product Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
              >
                <option value="active">Active (Available)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>

            {/* Price (Retail) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Retail Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                required
                min={0}
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
              />
            </div>

            {/* Cost Price */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Cost Price (₹)
              </label>
              <input
                type="number"
                name="costPrice"
                min={0}
                value={formData.costPrice}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
              />
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Current Stock *
              </label>
              <input
                type="number"
                name="stock"
                required
                min={0}
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
              />
            </div>

            {/* Reorder Level */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Reorder Threshold
              </label>
              <input
                type="number"
                name="reorderLevel"
                min={0}
                value={formData.reorderLevel}
                onChange={handleChange}
                placeholder="10"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
              />
            </div>

            {/* Image URL Cover */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Book Cover Image Link (URL)
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/cover.jpg"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
              />
            </div>

            {/* Supplier */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Supplier / Publisher
              </label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                placeholder="e.g. HarperCollins Publishers"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide a brief synopsis of the book..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all resize-none"
              />
            </div>

          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-lg shadow-indigo-600/10 transition-all cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
              ) : editingProduct ? (
                'Save Changes'
              ) : (
                'Add Product'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ProductFormModal;
