import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Loading from '../Common/Loading';
import { FiFileText, FiShoppingBag, FiCreditCard, FiArrowRight } from 'react-icons/fi';

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [recentBills, setRecentBills] = useState([]);
  const [todaySummary, setTodaySummary] = useState({
    salesToday: 0,
    invoicesCount: 0
  });

  useEffect(() => {
    const loadEmployeeDashboardData = async () => {
      try {
        setLoading(true);
        // Load recent bills
        const billsData = await apiRequest('/bills');
        const userBills = billsData.bills || [];
        setRecentBills(userBills.slice(0, 5));

        // Calculate today's sales for this employee
        const today = new Date();
        today.setHours(0,0,0,0);

        const sales = userBills.filter(bill => {
          const billDate = new Date(bill.billDate);
          return billDate >= today && bill.status === 'completed';
        });

        const totalAmt = sales.reduce((sum, b) => sum + b.totalAmount, 0);

        setTodaySummary({
          salesToday: totalAmt,
          invoicesCount: sales.length
        });
      } catch (err) {
        console.error('Failed to load employee dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEmployeeDashboardData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Checkout Dashboard</h1>
          <p className="text-slate-400 text-xs mt-1 font-medium">Welcome back, {user?.name}! Manage your register sales below.</p>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3.5 py-2 rounded-xl">
          Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Sales Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Today's Sales Counter */}
        <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-6 rounded-2xl shadow-lg shadow-indigo-600/10 text-white flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">My Sales Today</span>
            <h2 className="text-2xl font-black">₹{todaySummary.salesToday.toFixed(2)}</h2>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <FiCreditCard className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Today's Bills Count */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Invoices Handled Today</span>
            <h2 className="text-2xl font-bold text-slate-800">{todaySummary.invoicesCount}</h2>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <FiShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Quick billing launch shortcut card */}
        <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm flex items-center justify-between border-dashed hover:border-indigo-400 hover:bg-slate-50/50 transition-all duration-300 group">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">Quick Actions</span>
            <h2 className="text-sm font-bold text-slate-800">Launch POS Billing</h2>
            <Link 
              to="/billing" 
              className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1 mt-1 hover:underline"
            >
              <span>Go to Register</span>
              <FiArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
            <FiFileText className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800">My Recent Invoices</h3>
            <p className="text-[11px] font-medium text-slate-400">Invoices you generated at this terminal</p>
          </div>
          <Link 
            to="/billing" 
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
          >
            <span>POS Register</span>
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
                      <div className="font-semibold text-slate-700">{bill.customerName}</div>
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
                    You haven't generated any invoices today. Click 'Go to Register' to checkout your first customer!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default EmployeeDashboard;
