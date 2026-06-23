import React, { createContext, useState, useCallback } from 'react';
import { apiRequest } from '../services/api';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest('/settings');
      setSettings(data.settings);
      return data.settings;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = async (settingsData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest('/settings', {
        method: 'PUT',
        body: settingsData,
      });
      setSettings(data.settings);
      return data.settings;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLogo = async (logoFile) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);

      const data = await apiRequest('/settings/logo', {
        method: 'POST',
        body: formData,
      });
      setSettings((prev) => ({
        ...prev,
        logo: data.logo,
      }));
      return data.logo;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        fetchSettings,
        updateSettings,
        updateLogo,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
