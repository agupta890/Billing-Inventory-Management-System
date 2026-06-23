import React, { useState, useEffect, useContext } from 'react';
import { SettingsContext } from '../../context/SettingsContext';
import Loading from '../Common/Loading';
import toast from 'react-hot-toast';
import { FiSave, FiInfo, FiCreditCard, FiUpload, FiImage } from 'react-icons/fi';

const CompanySettings = () => {
  const { settings, fetchSettings, updateSettings, updateLogo } = useContext(SettingsContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Form Fields
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [defaultGST, setDefaultGST] = useState(18);
  const [defaultDiscount, setDefaultDiscount] = useState(0);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  // Bank Details
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  // Logo URL
  const [logoUrl, setLogoUrl] = useState('');

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.error('Please select an image file');
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Logo image size must be less than 5MB');
    }

    setIsUploadingLogo(true);
    const loadingToast = toast.loading('Uploading logo to Cloudinary...');
    try {
      const uploadedLogo = await updateLogo(file);
      setLogoUrl(uploadedLogo.url);
      toast.success('Logo uploaded and saved successfully!', { id: loadingToast });
    } catch (err) {
      toast.error(err.message || 'Failed to upload logo', { id: loadingToast });
    } finally {
      setIsUploadingLogo(false);
    }
  };


  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await fetchSettings();
        if (data) {
          setCompanyName(data.companyName || '');
          setCompanyAddress(data.companyAddress || '');
          setCompanyPhone(data.companyPhone || '');
          setCompanyEmail(data.companyEmail || '');
          setGstNumber(data.gstNumber || '');
          setPanNumber(data.panNumber || '');
          setDefaultGST(data.defaultGST !== undefined ? data.defaultGST : 18);
          setDefaultDiscount(data.defaultDiscount !== undefined ? data.defaultDiscount : 0);
          setWhatsappNumber(data.whatsappNumber || '');
          
          setBankName(data.bankDetails?.bankName || '');
          setAccountNumber(data.bankDetails?.accountNumber || '');
          setIfscCode(data.bankDetails?.ifscCode || '');

          setLogoUrl(data.logo?.url || '');
        }
      } catch (err) {
        toast.error('Failed to load store configurations');
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [fetchSettings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName) {
      return toast.error('Company Name is required');
    }

    const payload = {
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      gstNumber,
      panNumber,
      defaultGST: Number(defaultGST),
      defaultDiscount: Number(defaultDiscount),
      whatsappNumber,
      bankDetails: {
        bankName,
        accountNumber,
        ifscCode
      },
      logo: {
        public_id: settings?.logo?.public_id || '',
        url: logoUrl
      }

    };

    setSaving(true);
    try {
      await updateSettings(payload);
      toast.success('Business configurations saved successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to save configurations');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Business Configuration</h1>
        <p className="text-slate-400 text-xs mt-1 font-medium">Manage store address, contact coordinates, taxes, bank details, and receipt logo</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Business details & Settings Form (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Company Details Block */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FiInfo className="text-indigo-600 w-4 h-4" />
              <span>Store Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
              
              {/* Store Name */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Bookstore Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Odyssey Book Emporium"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="e.g. Suite 42, Sector 15, New Delhi"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Contact Mobile Number
                </label>
                <input
                  type="tel"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Business Email Address
                </label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder="e.g. orders@odysseybooks.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              {/* GSTIN */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  GSTIN ID (Tax details)
                </label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="e.g. 07AAAAA1111A1Z1"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              {/* PAN */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Income Tax PAN
                </label>
                <input
                  type="text"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                  placeholder="e.g. AAAAA1111A"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

            </div>
          </div>

          {/* Bank Details Block */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FiCreditCard className="text-indigo-600 w-4 h-4" />
              <span>Receiving Bank Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-600">
              
              {/* Bank Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. HDFC Bank Ltd"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 50100012345678"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              {/* IFSC */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  IFSC Clearing Code
                </label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  placeholder="e.g. HDFC0000123"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: TAX PRESETS, LOGO, AND SUBMIT (Spans 1 column) */}
        <div className="space-y-6">
          
          {/* Tax / Discount Presets */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800">POS Register Presets</h3>
            <div className="space-y-3.5 text-xs font-semibold text-slate-600">
              
              {/* Default GST */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Default POS Tax (GST %)
                </label>
                <select
                  value={defaultGST}
                  onChange={(e) => setDefaultGST(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all"
                >
                  <option value={0}>0% Tax</option>
                  <option value={5}>5% GST</option>
                  <option value={12}>12% GST</option>
                  <option value={18}>18% GST</option>
                  <option value={28}>28% GST</option>
                </select>
              </div>

              {/* Default discount */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Default Discount rate (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={defaultDiscount}
                  onChange={(e) => setDefaultDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              {/* Whatsapp */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  WhatsApp Contact number
                </label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="e.g. 919876543210"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

            </div>
          </div>

          {/* Logo configuration */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800">Printable Invoice Logo</h3>
            <div className="space-y-4 text-xs font-semibold text-slate-600">
              
              {/* Logo preview bubble */}
              <div className="w-full h-32 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center relative overflow-hidden group">
                {logoUrl ? (
                  <img src={logoUrl} alt="Store logo" className="max-w-full max-h-full object-contain p-2" />
                ) : (
                  <div className="text-center text-slate-400 p-4">
                    <FiImage className="w-8 h-8 mx-auto mb-1" />
                    <span>No logo configured</span>
                  </div>
                )}
              </div>

              {/* Logo File Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Upload Logo File (PNG/JPG)
                </label>
                <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <FiUpload className="w-4 h-4 text-indigo-600" />
                  <span className="text-slate-600 text-xs font-bold">
                    {isUploadingLogo ? 'Uploading to Cloudinary...' : 'Choose Logo Image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingLogo}
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[9px] text-slate-400 mt-2 font-medium">Recommended: Square format (1:1), transparent PNG, up to 5MB.</p>
              </div>

            </div>
          </div>


          {/* Save trigger */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/15 cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                <span>Save Configurations</span>
              </>
            )}
          </button>

        </div>

      </form>

    </div>
  );
};

export default CompanySettings;
