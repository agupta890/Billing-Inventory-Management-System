import React, { useState, useEffect, useContext, useCallback } from 'react';
import { ProductContext } from '../../context/ProductContext';
import { AuthContext } from '../../context/AuthContext';
import ProductCard from './ProductCard';
import ProductFormModal from './ProductFormModal';
import Loading from '../Common/Loading';
import toast from 'react-hot-toast';
import { FiSearch, FiPlus, FiFilter } from 'react-icons/fi';

const ProductList = () => {
  const { products, loading, fetchProducts, addProduct, updateProduct, deleteProduct } = useContext(ProductContext);
  const { user } = useContext(AuthContext);
  const isOwner = user?.role === 'owner';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Debounced search / filter update
  useEffect(() => {
    fetchProducts({ search, category, status }).catch((err) =>
      console.error('Failed to load products:', err.message)
    );
  }, [search, category, status, fetchProducts]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product? All inventory logs for it will also be deleted.')) {
      try {
        await deleteProduct(id);
        toast.success('Book deleted successfully');
      } catch (err) {
        toast.error(err.message || 'Failed to delete book');
      }
    }
  };

  const handleFormSubmit = async (payload) => {
    if (editingProduct) {
      await updateProduct(editingProduct._id, payload);
      toast.success('Book updated successfully');
    } else {
      await addProduct(payload);
      toast.success('Book added successfully');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Book Catalog</h1>
          <p className="text-slate-400 text-xs mt-1 font-medium">Browse, search, and manage bookstore inventory</p>
        </div>

        {/* Add Product Trigger (Owner Only) */}
        {isOwner && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/15 transition-all cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add New Book</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <FiSearch className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Title, Author, or ISBN..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
          />
        </div>

        {/* Category & Status Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl w-full sm:w-auto">
            <FiFilter className="w-4 h-4" />
            <span>Filters</span>
          </div>

          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold focus:border-indigo-500 focus:bg-white outline-none w-full sm:w-auto"
          >
            <option value="">All Categories</option>
            <option value="Fiction">Fiction</option>
            <option value="Non-Fiction">Non-Fiction</option>
            <option value="Academic">Academic</option>
            <option value="Science">Science</option>
            <option value="Biography">Biography</option>
            <option value="Children">Children</option>
            <option value="Other">Other</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold focus:border-indigo-500 focus:bg-white outline-none w-full sm:w-auto"
          >
            <option value="">All Status</option>
            <option value="active">Active (Available)</option>
            <option value="inactive">Inactive (Hidden)</option>
          </select>
        </div>

      </div>

      {/* Products Grid Content */}
      {loading ? (
        <Loading />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
          <p className="text-slate-400 font-semibold">No books matching filters found.</p>
          {isOwner && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-100 transition-colors"
            >
              <span>Add Your First Book</span>
            </button>
          )}
        </div>
      )}

      {/* Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        editingProduct={editingProduct}
      />

    </div>
  );
};

export default ProductList;
