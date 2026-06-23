import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import Loading from '../Common/Loading';
import toast from 'react-hot-toast';
import { FiPercent, FiTrash2, FiPlus, FiX } from 'react-icons/fi';

const DiscountSettings = () => {
  const [loading, setLoading] = useState(true);
  const [discounts, setDiscounts] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // New discount form fields
  const [discountName, setDiscountName] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadDiscounts = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/discounts');
      setDiscounts(data.discounts || []);
    } catch (err) {
      toast.error('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscounts();
  }, []);

  const handleAddDiscount = async (e) => {
    e.preventDefault();
    if (!discountName || !discountPercent) {
      return toast.error('Please enter name and percent');
    }

    const payload = {
      discountName,
      discountPercent: Number(discountPercent),
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      isActive: true
    };

    setModalLoading(true);
    try {
      await apiRequest('/discounts', {
        method: 'POST',
        body: payload
      });

      toast.success('Discount created successfully');
      setIsAddOpen(false);
      
      // Clear fields
      setDiscountName('');
      setDiscountPercent('');
      setDescription('');
      setStartDate('');
      setEndDate('');

      loadDiscounts();
    } catch (err) {
      toast.error(err.message || 'Failed to create discount');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await apiRequest(`/discounts/${id}`, {
        method: 'PUT',
        body: { isActive: !currentStatus }
      });
      toast.success('Discount status updated');
      loadDiscounts();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteDiscount = async (id) => {
    if (confirm('Are you sure you want to delete this discount?')) {
      try {
        await apiRequest(`/discounts/${id}`, { method: 'DELETE' });
        toast.success('Discount deleted');
        loadDiscounts();
      } catch (err) {
        toast.error('Failed to delete discount');
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Campaign Discounts</h1>
          <p className="text-slate-400 text-xs mt-1 font-medium">Configure store discounts and percentage promotional rates</p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/15 cursor-pointer"
        >
          <FiPlus className="w-4 h-4" />
          <span>New Discount Campaign</span>
        </button>
      </div>

      {/* Discount Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-4.5 px-6">Campaign Name</th>
                <th className="py-4.5 px-4 text-center">Rate (%)</th>
                <th className="py-4.5 px-4">Validity Range</th>
                <th className="py-4.5 px-4">Description</th>
                <th className="py-4.5 px-4 text-center">Status</th>
                <th className="py-4.5 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {discounts.length > 0 ? (
                discounts.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-4.5 px-6 font-extrabold text-slate-800">{d.discountName}</td>
                    <td className="py-4.5 px-4 text-center font-extrabold text-indigo-600 text-sm">{d.discountPercent}% Off</td>
                    <td className="py-4.5 px-4 font-semibold text-slate-500">
                      {d.startDate ? new Date(d.startDate).toLocaleDateString() : 'Always'} &mdash; {d.endDate ? new Date(d.endDate).toLocaleDateString() : 'Forever'}
                    </td>
                    <td className="py-4.5 px-4 max-w-[200px] truncate" title={d.description}>
                      {d.description || 'No description provided'}
                    </td>
                    <td className="py-4.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(d._id, d.isActive)}
                        className={`inline-flex px-2.5 py-1 rounded-full font-bold text-[9px] uppercase cursor-pointer transition-colors ${
                          d.isActive 
                            ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' 
                            : 'bg-slate-150 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {d.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-4.5 px-6 text-center">
                      <button
                        onClick={() => handleDeleteDiscount(d._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Delete discount"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                    No discount campaigns configured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl border border-slate-100 p-6 flex flex-col space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="font-extrabold text-slate-800 text-base">New Discount Offer</h3>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDiscount} className="space-y-4 text-xs font-semibold">
              
              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Discount Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  value={discountName}
                  onChange={(e) => setDiscountName(e.target.value)}
                  placeholder="e.g. Festival Season Offer"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white outline-none"
                />
              </div>

              {/* Percent */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Percentage rate (%) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Applicable on fiction category"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white outline-none"
                />
              </div>

              {/* Start & End Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold focus:border-indigo-500 focus:bg-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold focus:border-indigo-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {modalLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  ) : (
                    'Create Campaign'
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

export default DiscountSettings;
