import React, { createContext, useState, useCallback } from 'react';
import { apiRequest } from '../services/api';

export const BillingContext = createContext();

export const BillingProvider = ({ children }) => {
  const [bills, setBills] = useState([]);
  const [cart, setCart] = useState([]); // array of { product, quantity }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBills = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.customerPhone) params.append('customerPhone', filters.customerPhone);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);

      const queryString = params.toString();
      const endpoint = `/bills${queryString ? `?${queryString}` : ''}`;

      const data = await apiRequest(endpoint);
      setBills(data.bills);
      return data.bills;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map((item) =>
          item.product._id === product._id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product._id === productId
          ? { ...item, quantity: Math.max(1, Math.min(item.product.stock, quantity)) }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateCartTotals = (discountPercent = 0, gstPercent = 18) => {
    const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    const discountAmount = (subtotal * discountPercent) / 100;
    const afterDiscount = subtotal - discountAmount;
    const gstAmount = (afterDiscount * gstPercent) / 100;
    const totalAmount = afterDiscount + gstAmount;

    return {
      subtotal,
      discountPercent,
      discountAmount,
      gstPercent,
      gstAmount,
      totalAmount,
    };
  };

  const createBill = async (billData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest('/bills', {
        method: 'POST',
        body: billData,
      });
      setBills((prev) => [data.bill, ...prev]);
      clearCart();
      return data.bill;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const shareBillWhatsApp = async (billId) => {
    try {
      const data = await apiRequest(`/bills/${billId}/whatsapp`, {
        method: 'POST',
      });
      return data;
    } catch (err) {
      console.error('Failed to share via WhatsApp:', err.message);
      throw err;
    }
  };

  return (
    <BillingContext.Provider
      value={{
        bills,
        cart,
        loading,
        error,
        fetchBills,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        calculateCartTotals,
        createBill,
        shareBillWhatsApp,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};
