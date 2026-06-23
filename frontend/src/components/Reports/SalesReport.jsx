import React, { useState, useEffect, useContext } from 'react';
import { apiRequest } from '../../services/api';
import { SettingsContext } from '../../context/SettingsContext';
import { generateBillPDF } from '../../utils/pdfGenerator';
import Loading from '../Common/Loading';
import toast from 'react-hot-toast';
import { 
  FiTrendingUp, 
  FiFileText, 
  FiLayers, 
  FiPrinter, 
  FiShare2, 
  FiCalendar, 
  FiClock, 
  FiSearch,
  FiX
} from 'react-icons/fi';

const SalesReport = () => {
  const { settings, fetchSettings } = useContext(SettingsContext);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('sales'); // 'sales', 'inventory', 'history'

  // Reports data
  const [salesSummary, setSalesSummary] = useState(null);
  const [paymentBreakdown, setPaymentBreakdown] = useState([]);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  
  // Billing history
  const [bills, setBills] = useState([]);
  const [historySearch, setHistorySearch] = useState('');
  
  // Date Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadReports = async () => {
    try {
      setLoading(true);
      
      const salesQuery = (startDate || endDate) 
        ? `?startDate=${startDate}&endDate=${endDate}` 
        : '';

      const salesData = await apiRequest(`/reports/sales${salesQuery}`);
      const invData = await apiRequest('/reports/inventory');
      const billsData = await apiRequest('/bills');

      setSalesSummary(salesData.stats || null);
      setPaymentBreakdown(salesData.paymentStats || []);
      
      setInventoryReport(invData.summary || null);
      setCategoryBreakdown(invData.categories || []);

      setBills(billsData.bills || []);

      if (!settings) {
        fetchSettings().catch(err => console.error(err.message));
      }
    } catch (err) {
      toast.error('Failed to retrieve reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [startDate, endDate]);

  const handlePrint = (bill) => {
    generateBillPDF(bill, settings || {});
    toast.success('Invoice PDF generated');
  };

  const handleShareWhatsApp = async (bill) => {
    if (!bill.customerPhone) {
      return toast.error('No customer phone number available');
    }
    try {
      const data = await apiRequest(`/bills/${bill._id}/whatsapp`, { method: 'POST' });
      if (data.whatsappLink) {
        window.open(data.whatsappLink, '_blank');
        toast.success('WhatsApp shared');
      }
    } catch (err) {
      toast.error('WhatsApp failed to send');
    }
  };

  // Filtered bills in history tab
  const filteredBills = bills.filter(b => 
    b.billNumber.toLowerCase().includes(historySearch.toLowerCase()) ||
    b.customerName.toLowerCase().includes(historySearch.toLowerCase()) ||
    (b.customerPhone && b.customerPhone.includes(historySearch))
  );

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Business Reports</h1>
          <p className="text-slate-400 text-xs mt-1 font-medium">Verify sales, inventory valuations, aggregates, and past orders</p>
        </div>

        {/* Date Filters (Only visible on sales report tab) */}
        {tab === 'sales' && (
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-100 p-2.5 rounded-xl shadow-sm">
            <FiCalendar className="w-4 h-4 text-indigo-600" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent outline-none cursor-pointer focus:text-indigo-600"
            />
            <span className="text-slate-300">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent outline-none cursor-pointer focus:text-indigo-600"
            />
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-100"
                title="Clear Dates"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-150 gap-4">
        <button
          onClick={() => setTab('sales')}
          className={`pb-3 font-bold text-sm border-b-2 px-1 transition-all cursor-pointer flex items-center gap-2 ${
            tab === 'sales'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FiTrendingUp className="w-4 h-4" />
          <span>Sales & Revenue</span>
        </button>
        <button
          onClick={() => setTab('inventory')}
          className={`pb-3 font-bold text-sm border-b-2 px-1 transition-all cursor-pointer flex items-center gap-2 ${
            tab === 'inventory'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FiLayers className="w-4 h-4" />
          <span>Inventory Valuation</span>
        </button>
        <button
          onClick={() => setTab('history')}
          className={`pb-3 font-bold text-sm border-b-2 px-1 transition-all cursor-pointer flex items-center gap-2 ${
            tab === 'history'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FiFileText className="w-4 h-4" />
          <span>Billing History</span>
        </button>
      </div>

      {/* TAB CONTENT: SALES & REVENUE */}
      {tab === 'sales' && salesSummary && (
        <div className="space-y-6">
          {/* Detailed revenue metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Gross Sales</span>
              <h3 className="text-xl font-bold text-slate-800">₹{salesSummary.totalSubtotal.toFixed(2)}</h3>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Discounts Handed</span>
              <h3 className="text-xl font-bold text-rose-500">-₹{salesSummary.totalDiscount.toFixed(2)}</h3>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">GST Tax Collected</span>
              <h3 className="text-xl font-bold text-indigo-600">₹{salesSummary.totalGST.toFixed(2)}</h3>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Net Store Revenue</span>
              <h3 className="text-xl font-extrabold text-emerald-600">₹{salesSummary.totalRevenue.toFixed(2)}</h3>
            </div>
          </div>

          {/* Payment Method aggregates chart */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm max-w-md space-y-4">
            <div>
              <h3 className="font-bold text-slate-800">Payment Breakdown</h3>
              <p className="text-[11px] font-medium text-slate-400">Aggregated revenue collected by transaction channel</p>
            </div>
            
            <div className="space-y-4">
              {paymentBreakdown.map((item) => {
                const percent = salesSummary.totalRevenue > 0 ? (item.total / salesSummary.totalRevenue) * 100 : 0;
                return (
                  <div key={item._id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500 uppercase">{item._id}</span>
                      <span className="text-slate-800">₹{item.total.toFixed(2)} ({percent.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: INVENTORY VALUATION */}
      {tab === 'inventory' && inventoryReport && (
        <div className="space-y-6">
          {/* Valuation Summaries */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Titles</span>
              <h3 className="text-xl font-bold text-slate-800">{inventoryReport.totalItems} books</h3>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Stock Count</span>
              <h3 className="text-xl font-bold text-slate-800">{inventoryReport.totalStock} items</h3>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Net Stock Valuation (Retail)</span>
              <h3 className="text-xl font-extrabold text-indigo-600">₹{inventoryReport.retailValuation.toFixed(2)}</h3>
            </div>
          </div>

          {/* Category distribution split */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm max-w-lg space-y-4">
            <div>
              <h3 className="font-bold text-slate-800">Stock Categorization</h3>
              <p className="text-[11px] font-medium text-slate-400">Total books and stock units by category</p>
            </div>
            
            <div className="space-y-4 text-xs font-semibold">
              {categoryBreakdown.map((item) => {
                const percent = inventoryReport.totalStock > 0 ? (item.totalStock / inventoryReport.totalStock) * 100 : 0;
                return (
                  <div key={item._id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold">{item._id}</span>
                      <span className="text-slate-800">{item.count} titles &bull; {item.totalStock} units ({percent.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-violet-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: BILLING HISTORY */}
      {tab === 'history' && (
        <div className="space-y-4">
          
          {/* History search bar */}
          <div className="relative max-w-md bg-white border border-slate-100 rounded-xl">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <FiSearch className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search by invoice number, name, or phone..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold focus:border-indigo-500 focus:bg-white outline-none"
            />
          </div>

          {/* List Table */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Bill No</th>
                    <th className="py-4 px-4">Customer Name</th>
                    <th className="py-4 px-4">Date</th>
                    <th className="py-4 px-4 text-center">Items</th>
                    <th className="py-4 px-4 text-right">Grand Total</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {filteredBills.length > 0 ? (
                    filteredBills.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-800">{b.billNumber}</td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-700">{b.customerName}</div>
                          <div className="text-[10px] text-slate-400">{b.customerPhone || 'No Phone'}</div>
                        </td>
                        <td className="py-4 px-4 font-medium">{new Date(b.billDate).toLocaleDateString()}</td>
                        <td className="py-4 px-4 text-center font-bold">{b.items?.length || 0}</td>
                        <td className="py-4 px-4 text-right font-extrabold text-slate-800">₹{b.totalAmount.toFixed(2)}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                            b.paymentStatus === 'paid' 
                              ? 'bg-emerald-500/10 text-emerald-600' 
                              : 'bg-amber-500/10 text-amber-600'
                          }`}>
                            {b.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handlePrint(b)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-250 cursor-pointer"
                              title="Print Invoice"
                            >
                              <FiPrinter className="w-3.5 h-3.5" />
                            </button>
                            {b.customerPhone && (
                              <button
                                onClick={() => handleShareWhatsApp(b)}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-250 cursor-pointer"
                                title="Share via WhatsApp"
                              >
                                <FiShare2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                        No billing history match.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default SalesReport;
