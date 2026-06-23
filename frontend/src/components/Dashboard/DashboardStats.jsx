import React from 'react';
import { FiTrendingUp, FiShoppingBag, FiAlertTriangle, FiBookOpen } from 'react-icons/fi';

const DashboardStats = ({ stats }) => {
  const cards = [
    {
      title: 'Total Revenue',
      value: `₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: FiTrendingUp,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Invoices Generated',
      value: stats.invoiceCount || 0,
      icon: FiShoppingBag,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Low Stock Books',
      value: stats.lowStockCount || 0,
      icon: FiAlertTriangle,
      color: 'bg-rose-500',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      alert: (stats.lowStockCount || 0) > 0,
    },
    {
      title: 'Books Registered',
      value: stats.productCount || 0,
      icon: FiBookOpen,
      color: 'bg-violet-500',
      textColor: 'text-violet-600',
      bgColor: 'bg-violet-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {card.title}
              </span>
              <span className="text-2xl font-bold text-slate-800 block">
                {card.value}
              </span>
            </div>
            <div className={`p-3.5 rounded-xl transition-transform duration-300 group-hover:scale-110 ${card.bgColor} ${card.textColor}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
