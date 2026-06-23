import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Providers
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { BillingProvider } from './context/BillingContext';
import { SettingsProvider } from './context/SettingsContext';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Common Components
import Header from './components/Common/Header';
import Sidebar from './components/Common/Sidebar';
import Footer from './components/Common/Footer';

// Pages
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import ProductList from './components/Products/ProductList';
import BillingForm from './components/Billing/BillingForm';
import InventoryDashboard from './components/Inventory/InventoryDashboard';
import DiscountSettings from './components/Settings/DiscountSettings';
import SalesReport from './components/Reports/SalesReport';
import CompanySettings from './components/Settings/CompanySettings';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Content main */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <BillingProvider>
          <SettingsProvider>
            <Router>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Dashboard layout protected route */}
                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/billing" element={<BillingForm />} />
                  <Route path="/inventory" element={<InventoryDashboard />} />
                  <Route path="/reports" element={<SalesReport />} />
                  
                  {/* Owner-only configurations */}
                  <Route 
                    path="/discounts" 
                    element={
                      <ProtectedRoute allowedRoles={['owner']}>
                        <DiscountSettings />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute allowedRoles={['owner']}>
                        <CompanySettings />
                      </ProtectedRoute>
                    } 
                  />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            <Toaster position="top-center" />
          </SettingsProvider>
        </BillingProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
