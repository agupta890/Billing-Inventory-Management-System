import React, { useState, useEffect, useContext } from 'react';
import { apiRequest } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Loading from '../Common/Loading';
import toast from 'react-hot-toast';
import { FiLayers, FiAlertTriangle, FiPlus, FiMinus, FiList, FiClock } from 'react-icons/fi';

const InventoryDashboard = () => {
  const { user } = useContext(AuthContext);
  const isOwner = user?.role === 'owner';

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState('stock'); // 'stock' or 'logs'

  // Adjustment Modal States
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustType, setAdjustType] = useState('add'); // 'add' or 'remove'
  const [quantity, setQuantity] = useState('0');
  const [reason, setReason] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const prodData = await apiRequest('/products');
      const logsData = await apiRequest('/inventory');

      setProducts(prodData.products || []);
      setLogs(logsData.logs || []);
    } catch (err) {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventoryData();
  }, []);

  const handleOpenAdjust = (product, type) => {
    setSelectedProduct(product);
    setAdjustType(type);
    setQuantity('');
    setReason('');
    setIsAdjustOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!quantity || Number(quantity) <= 0) {
      return toast.error('Please enter a positive quantity');
    }

    const payload = {
      productId: selectedProduct._id,
      quantity: Number(quantity),
      reason: reason || `Manual adjustment - ${adjustType}`
    };

    setModalLoading(true);
    try {
      const endpoint = adjustType === 'add' ? '/inventory/add' : '/inventory/remove';
      await apiRequest(endpoint, {
        method: 'POST',
        body: payload
      });

      toast.success('Stock adjusted successfully');
      setIsAdjustOpen(false);
      loadInventoryData(); // reload statistics
    } catch (err) {
      toast.error(err.message || 'Failed to adjust stock');
    } finally {
      setModalLoading(false);
    }
  };

  // Compute stats
  const totalStockCount = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock <= p.reorderLevel && p.status === 'active').length;
  const valuation = products.reduce((sum, p) => sum + p.stock * p.price, 0);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Inventory Manager</h1>
        <p className="text-slate-400 text-xs mt-1 font-medium">Track stock levels, reorder alerts, and logs history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Total Stock */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Books in Stock</span>
            <h2 className="text-2xl font-bold text-slate-800">{totalStockCount} units</h2>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <FiLayers className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock count */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reorder Alerts</span>
            <h2 className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-rose-500' : 'text-slate-800'}`}>
              {lowStockCount} books
            </h2>
          </div>
          <div className={`p-3 rounded-xl ${lowStockCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
            <FiAlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Valuation */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Stock Retail Valuation</span>
            <h2 className="text-2xl font-bold text-slate-800">
              ₹{valuation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h2>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <span className="text-lg font-black leading-none">₹</span>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-150 gap-4">
        <button
          onClick={() => setTab('stock')}
          className={`pb-3 font-bold text-sm border-b-2 px-1 transition-all cursor-pointer flex items-center gap-2 ${
            tab === 'stock'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FiList className="w-4 h-4" />
          <span>Stock Summary</span>
        </button>
        <button
          onClick={() => setTab('logs')}
          className={`pb-3 font-bold text-sm border-b-2 px-1 transition-all cursor-pointer flex items-center gap-2 ${
            tab === 'logs'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FiClock className="w-4 h-4" />
          <span>Transaction Logs</span>
        </button>
      </div>

      {/* TAB CONTENT: STOCK SUMMARY */}
      {tab === 'stock' && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-4.5 px-6">Book Description</th>
                  <th className="py-4.5 px-4">Category</th>
                  <th className="py-4.5 px-4 text-right">Available Stock</th>
                  <th className="py-4.5 px-4 text-center">Alert Status</th>
                  {isOwner && <th className="py-4.5 px-6 text-center">Quick Adjust</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {products.length > 0 ? (
                  products.map((p) => {
                    const isOutOfStock = p.stock <= 0;
                    const isLow = p.stock > 0 && p.stock <= p.reorderLevel;
                    return (
                      <tr key={p._id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-extrabold text-slate-800 text-sm leading-normal">{p.title}</div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">by {p.author}</div>
                        </td>
                        <td className="py-4 px-4 font-medium">{p.category}</td>
                        <td className="py-4 px-4 font-bold text-slate-800 text-right">{p.stock} units</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                            isOutOfStock 
                              ? 'bg-slate-900 text-white' 
                              : isLow 
                              ? 'bg-rose-500/10 text-rose-500' 
                              : 'bg-emerald-500/10 text-emerald-600'
                          }`}>
                            {isOutOfStock ? 'Out of stock' : isLow ? 'Low Stock alert' : 'Well stocked'}
                          </span>
                        </td>
                        
                        {/* Adjust Stocks Buttons (Owner Only) */}
                        {isOwner && (
                          <td className="py-4 px-6 text-center">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => handleOpenAdjust(p, 'add')}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors cursor-pointer"
                                title="Add Stock"
                              >
                                <FiPlus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenAdjust(p, 'remove')}
                                disabled={isOutOfStock}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  isOutOfStock
                                    ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                                    : 'border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-250 hover:bg-rose-50 cursor-pointer'
                                }`}
                                title="Remove Stock"
                              >
                                <FiMinus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                      No books registered in inventory.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TRANSACTION LOGS */}
      {tab === 'logs' && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-4.5 px-6">Book Name</th>
                  <th className="py-4.5 px-4 text-center">Change Qty</th>
                  <th className="py-4.5 px-4 text-center">Log Type</th>
                  <th className="py-4.5 px-4">Reason / Reference</th>
                  <th className="py-4.5 px-4">Operator</th>
                  <th className="py-4.5 px-6">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {log.productId?.title || 'Unknown Product'}
                      </td>
                      <td className={`py-4 px-4 text-center font-bold ${log.quantity > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                          log.type === 'add' 
                            ? 'bg-indigo-500/10 text-indigo-600' 
                            : log.type === 'sale' 
                            ? 'bg-emerald-500/10 text-emerald-600' 
                            : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-500 max-w-[200px] truncate" title={log.reason}>
                        {log.reason || 'Manual adjustment'}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-700">
                        {log.recordedBy?.name || 'System'}
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                      No stock transaction history logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STOCK ADJUSTMENT MODAL (Owner Only) */}
      {isAdjustOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl border border-slate-100 p-6 flex flex-col space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="font-extrabold text-slate-800 text-base capitalize">
                {adjustType === 'add' ? 'Increase Stock' : 'Decrease Stock'}
              </h3>
              <button 
                onClick={() => setIsAdjustOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-1 text-slate-500">
              <p>Book: <span className="font-extrabold text-slate-800">{selectedProduct.title}</span></p>
              <p>Current Stock Level: <span className="font-bold text-slate-700">{selectedProduct.stock} units</span></p>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs font-semibold">
              {/* Quantity */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Quantity *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter change quantity"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white outline-none"
                />
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Adjustment Reason
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={adjustType === 'add' ? 'e.g. Stock replenished' : 'e.g. Damaged inventory'}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsAdjustOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className={`px-5 py-2 rounded-lg text-white font-bold cursor-pointer flex items-center gap-1.5 ${
                    adjustType === 'add' 
                      ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10 shadow-lg' 
                      : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/10 shadow-lg'
                  }`}
                >
                  {modalLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  ) : (
                    'Confirm Change'
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default InventoryDashboard;
