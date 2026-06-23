import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import DashboardStats from './DashboardStats';
import Loading from '../Common/Loading';
import { FiPlus, FiFileText, FiTrendingUp, FiPercent, FiSettings, FiArrowRight } from 'react-icons/fi';

const OwnerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    invoiceCount: 0,
    lowStockCount: 0,
    productCount: 0
  });
  const [recentBills, setRecentBills] = useState([]);
  const [paymentStats, setPaymentStats] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Load sales report stats
        const salesData = await apiRequest('/reports/sales');
        // Load inventory report stats
        const inventoryData = await apiRequest('/reports/inventory');
        // Load recent bills
        const billsData = await apiRequest('/bills');
        // Load low stock alerts
        const lowStockData = await apiRequest('/inventory/low-stock');

        setStats({
          totalRevenue: salesData.stats?.totalRevenue || 0,
          invoiceCount: salesData.stats?.invoiceCount || 0,
          lowStockCount: inventoryData.summary?.lowStockCount || 0,
          productCount: inventoryData.summary?.totalItems || 0
        });

        setPaymentStats(salesData.paymentStats || []);
        setRecentBills(billsData.bills ? billsData.bills.slice(0, 5) : []);
        setLowStockProducts(lowStockData.products ? lowStockData.products.slice(0, 5) : []);
      } catch (err) {
        console.error('Failed to load owner dashboard data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Owner Dashboard</h1>
          <p className="text-slate-400 text-xs mt-1 font-medium">Business analytics and bookstore stats overview</p>
        </div>

        {/* Date Stamp */}
        <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3.5 py-2 rounded-xl">
          Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats stats={stats} />

      {/* Main Grid: Content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Recent Orders & Alerts (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Invoices Card */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Recent Invoices</h3>
                <p className="text-[11px] font-medium text-slate-400">Latest completed billing transactions</p>
              </div>
              <Link 
                to="/billing" 
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
              >
                <span>View All</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 pr-4">Bill No</th>
                    <th className="py-3 pr-4">Customer</th>
                    <th className="py-3 pr-4">Date</th>
                    <th className="py-3 pr-4">Total</th>
                    <th className="py-3 pr-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-600">
                  {recentBills.length > 0 ? (
                    recentBills.map((bill) => (
                      <tr key={bill._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 font-semibold text-slate-800">{bill.billNumber}</td>
                        <td className="py-3.5">
                          <div className="font-medium text-slate-700">{bill.customerName}</div>
                          <div className="text-[10px] text-slate-400">{bill.customerPhone}</div>
                        </td>
                        <td className="py-3.5">{new Date(bill.billDate).toLocaleDateString()}</td>
                        <td className="py-3.5 font-bold text-slate-800">₹{bill.totalAmount.toFixed(2)}</td>
                        <td className="py-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                            bill.paymentStatus === 'paid' 
                              ? 'bg-emerald-500/10 text-emerald-600' 
                              : 'bg-amber-500/10 text-amber-600'
                          }`}>
                            {bill.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                        No recent invoices found. Let's create one!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Alerts Card */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-rose-500 flex items-center gap-2">
                  <span>Reorder Alerts</span>
                </h3>
                <p className="text-[11px] font-medium text-slate-400">Books running below reorder threshold</p>
              </div>
              <Link 
                to="/inventory" 
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
              >
                <span>Manage Stock</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => (
                  <div 
                    key={product._id} 
                    className="flex items-center justify-between p-3.5 bg-rose-50/30 border border-rose-100/50 rounded-xl"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="font-bold text-slate-800 text-xs truncate">{product.title}</div>
                      <div className="text-[10px] text-slate-400 font-medium truncate">by {product.author}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[10px] text-slate-400 font-bold">In Stock</div>
                      <div className="text-xs font-black text-rose-600">{product.stock} / {product.reorderLevel}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-6 text-center text-slate-400 text-xs font-semibold">
                  All books are well stocked!
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Quick Action Panel & Payment Split (Spans 1 column) */}
        <div className="space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800">Quick Operations</h3>
            <div className="grid grid-cols-2 gap-3.5">
              <Link 
                to="/billing" 
                className="flex flex-col items-center justify-center p-4 bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-100 text-indigo-600 rounded-xl transition-all duration-200 text-center space-y-2 group"
              >
                <FiFileText className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold leading-none">New Bill</span>
              </Link>
              <Link 
                to="/products" 
                className="flex flex-col items-center justify-center p-4 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-100 text-emerald-600 rounded-xl transition-all duration-200 text-center space-y-2 group"
              >
                <FiPlus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold leading-none">Add Book</span>
              </Link>
              <Link 
                to="/discounts" 
                className="flex flex-col items-center justify-center p-4 bg-violet-50 hover:bg-violet-100/70 border border-violet-100 text-violet-600 rounded-xl transition-all duration-200 text-center space-y-2 group"
              >
                <FiPercent className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold leading-none">Discounts</span>
              </Link>
              <Link 
                to="/settings" 
                className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-150 border border-slate-200 text-slate-600 rounded-xl transition-all duration-200 text-center space-y-2 group"
              >
                <FiSettings className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold leading-none">Settings</span>
              </Link>
            </div>
          </div>

          {/* Payment Method Breakdown Card */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-bold text-slate-800">Payment Breakdown</h3>
              <p className="text-[11px] font-medium text-slate-400">Total collected by payment method</p>
            </div>
            
            <div className="space-y-3.5">
              {paymentStats.length > 0 ? (
                paymentStats.map((item) => {
                  const percent = stats.totalRevenue > 0 ? (item.total / stats.totalRevenue) * 100 : 0;
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
                })
              ) : (
                <div className="py-4 text-center text-slate-400 text-xs font-semibold">
                  No sales recorded yet.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default OwnerDashboard;
