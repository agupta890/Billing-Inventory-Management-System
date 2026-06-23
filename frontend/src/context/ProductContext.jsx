import React, { createContext, useState, useCallback } from 'react';
import { apiRequest } from '../services/api';

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.sort) params.append('sort', filters.sort);

      const queryString = params.toString();
      const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
      
      const data = await apiRequest(endpoint);
      setProducts(data.products);
      return data.products;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = async (productData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest('/products', {
        method: 'POST',
        body: productData,
      });
      setProducts((prev) => [data.product, ...prev]);
      return data.product;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id, productData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest(`/products/${id}`, {
        method: 'PUT',
        body: productData,
      });
      setProducts((prev) => prev.map((p) => (p._id === id ? data.product : p)));
      return data.product;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiRequest(`/products/${id}`, {
        method: 'DELETE',
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
