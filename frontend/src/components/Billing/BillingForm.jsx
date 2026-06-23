import React, { useState, useEffect, useContext } from 'react';
import { ProductContext } from '../../context/ProductContext';
import { BillingContext } from '../../context/BillingContext';
import { SettingsContext } from '../../context/SettingsContext';
import { generateBillPDF } from '../../utils/pdfGenerator';
import Loading from '../Common/Loading';
import toast from 'react-hot-toast';
import { 
  FiSearch, 
  FiShoppingCart, 
  FiTrash, 
  FiPlus, 
  FiMinus, 
  FiPrinter, 
  FiShare2, 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiCheckCircle,
  FiX
} from 'react-icons/fi';

const BillingForm = () => {
  const { products, fetchProducts } = useContext(ProductContext);
  const { 
    cart, 
    addToCart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart, 
    calculateCartTotals, 
    createBill,
    shareBillWhatsApp 
  } = useContext(BillingContext);
  const { settings, fetchSettings } = useContext(SettingsContext);

  const [search, setSearch] = useState('');
  
  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [gstPercent, setGstPercent] = useState(18);
  const [notes, setNotes] = useState('');

  // Modal / Success states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [createdBill, setCreatedBill] = useState(null);

  useEffect(() => {
    fetchProducts({ status: 'active' }).catch(err => console.error(err.message));
    if (!settings) {
      fetchSettings().catch(err => console.error(err.message));
    }
  }, [fetchProducts, settings, fetchSettings]);

  // Set default settings values once settings are loaded
  useEffect(() => {
    if (settings) {
      setGstPercent(settings.defaultGST !== undefined ? settings.defaultGST : 18);
      setDiscountPercent(settings.defaultDiscount !== undefined ? settings.defaultDiscount : 0);
    }
  }, [settings]);

  // Filter products by search text
  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.author.toLowerCase().includes(search.toLowerCase()) ||
    (p.isbn && p.isbn.includes(search))
  );

  const totals = calculateCartTotals(discountPercent, gstPercent);

  const handleCheckoutSubmit = async () => {
    if (!customerName) {
      return toast.error('Customer name is required for checkout');
    }
    if (cart.length === 0) {
      return toast.error('Cart is empty');
    }

    const payload = {
      customerName,
      customerPhone,
      customerEmail,
      items: cart.map(item => ({
        productId: item.product._id,
        quantity: item.quantity
      })),
      discountPercent: Number(discountPercent),
      gstPercent: Number(gstPercent),
      paymentMethod,
      paymentStatus,
      notes,
      status: 'completed'
    };

    try {
      const bill = await createBill(payload);
      setCreatedBill(bill);
      toast.success('Bill generated successfully!');
      setIsPreviewOpen(false);
      setIsSuccessOpen(true);
      
      // Clear checkout form fields
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setNotes('');
    } catch (err) {
      toast.error(err.message || 'Failed to complete checkout');
    }
  };

  const handlePrintPDF = (bill) => {
    generateBillPDF(bill, settings || {});
    toast.success('PDF invoice generated!');
  };

  const handleShareWhatsApp = async (billId) => {
    try {
      const data = await shareBillWhatsApp(billId);
      if (data.whatsappLink) {
        window.open(data.whatsappLink, '_blank');
        toast.success('WhatsApp link opened!');
      }
    } catch (err) {
      toast.error('Failed to trigger WhatsApp share');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      
      {/* LEFT PANEL: POS Book Browser (Spans 7 columns) */}
      <div className="lg:col-span-7 flex flex-col h-full bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 min-h-[400px]">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Search Books</h2>
          <p className="text-[11px] font-medium text-slate-400">Click to add items to customer invoice register</p>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <FiSearch className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type Title, Author, or ISBN..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
          />
        </div>

        {/* Browser Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredProducts.map((p) => {
                const inCart = cart.find(item => item.product._id === p._id);
                const isOutOfStock = p.stock <= 0;
                
                return (
                  <button
                    key={p._id}
                    disabled={isOutOfStock}
                    onClick={() => addToCart(p, 1)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 group relative ${
                      isOutOfStock
                        ? 'opacity-50 bg-slate-50 border-slate-200 cursor-not-allowed'
                        : 'border-slate-100 bg-white hover:border-indigo-500 hover:shadow-sm'
                    }`}
                  >
                    {/* Tiny Cover / placeholder */}
                    <div className="w-12 h-16 rounded bg-slate-50 border border-slate-150 flex-shrink-0 flex items-center justify-center font-bold text-[9px] text-indigo-300 overflow-hidden relative">
                      {p.image?.url ? (
                        <img src={p.image.url} alt="" className="w-full h-full object-cover" />
                      ) : 'BOOK'}
                    </div>

                    {/* Book Text Info */}
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-slate-800 text-xs truncate leading-normal">
                        {p.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">by {p.author}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-black text-slate-700">₹{p.price.toFixed(2)}</span>
                        <span className={`text-[9px] font-bold ${p.stock <= p.reorderLevel ? 'text-rose-500' : 'text-slate-400'}`}>
                          {isOutOfStock ? 'Out of stock' : `${p.stock} left`}
                        </span>
                      </div>
                    </div>

                    {/* Quick Badge Indicators */}
                    {inCart && (
                      <span className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[9px] shadow-sm animate-scale">
                        {inCart.quantity}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
              <p className="text-sm font-semibold">No books found matching search.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: CART REGISTER (Spans 5 columns) */}
      <div className="lg:col-span-5 flex flex-col h-full bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 min-h-[450px]">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <FiShoppingCart className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold tracking-tight">POS Cart</h2>
          </div>
          {cart.length > 0 && (
            <button 
              onClick={clearCart}
              className="text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-md transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Cart Item Entries */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div 
                key={item.product._id} 
                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="font-extrabold text-slate-700 text-xs truncate leading-snug">
                    {item.product.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">₹{item.product.price.toFixed(2)} each</div>
                </div>

                {/* Adjust Quantities */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                    <button 
                      onClick={() => updateCartQuantity(item.product._id, item.quantity - 1)}
                      className="p-1.5 text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      <FiMinus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-700">{item.quantity}</span>
                    <button 
                      onClick={() => addToCart(item.product, 1)}
                      className="p-1.5 text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      <FiPlus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Remove Row */}
                  <button 
                    onClick={() => removeFromCart(item.product._id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <FiTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-xl py-12 px-4 text-center">
              <FiShoppingCart className="w-10 h-10 mb-2.5 text-slate-300" />
              <p className="text-xs font-semibold"> POS Terminal is empty.</p>
              <p className="text-[10px] text-slate-400 mt-1">Select books from the left browser grid.</p>
            </div>
          )}
        </div>

        {/* Customer Form Settings */}
        <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
          
          {/* Customer Name */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <FiUser className="w-3.5 h-3.5" />
            </span>
            <input 
              type="text" 
              placeholder="Customer Name *" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:bg-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Customer Phone */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <FiPhone className="w-3.5 h-3.5" />
              </span>
              <input 
                type="tel" 
                maxLength={10}
                placeholder="Phone (optional)" 
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:bg-white outline-none"
              />
            </div>

            {/* Customer Email */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <FiMail className="w-3.5 h-3.5" />
              </span>
              <input 
                type="email" 
                placeholder="Email (optional)" 
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Payment Method */}
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:border-indigo-500 outline-none"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI / QR</option>
                <option value="card">Card</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            {/* Discount Percent */}
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:border-indigo-500 outline-none"
              />
            </div>

            {/* GST Percent */}
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                GST (%)
              </label>
              <select
                value={gstPercent}
                onChange={(e) => setGstPercent(Number(e.target.value))}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:border-indigo-500 outline-none"
              >
                <option value={0}>0% Tax</option>
                <option value={5}>5% GST</option>
                <option value={12}>12% GST</option>
                <option value={18}>18% GST</option>
                <option value={28}>28% GST</option>
              </select>
            </div>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 font-medium">
            <span>Subtotal:</span>
            <span>₹{totals.subtotal.toFixed(2)}</span>
          </div>

          {totals.discountAmount > 0 && (
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>Discount ({totals.discountPercent}%):</span>
              <span className="text-rose-500">-₹{totals.discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-slate-500 font-medium">
            <span>GST ({totals.gstPercent}%):</span>
            <span>₹{totals.gstAmount.toFixed(2)}</span>
          </div>

          <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-sm font-bold text-slate-800">
            <span>Grand Total:</span>
            <span className="text-base text-indigo-600">₹{totals.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Checkout Trigger */}
        <button
          onClick={() => {
            if (!customerName) return toast.error('Customer name is required');
            if (cart.length === 0) return toast.error('Add items to cart first');
            setIsPreviewOpen(true);
          }}
          disabled={cart.length === 0}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/15 cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          <span>Propose Checkout</span>
        </button>

      </div>

      {/* INVOICE PREVIEW MODAL */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800 text-lg">Bill Preview & Complete</h3>
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Receipt Visual Structure */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4 font-mono text-xs">
                
                {/* Header */}
                <div className="text-center border-b border-dashed border-slate-300 pb-4">
                  <h4 className="font-extrabold text-sm uppercase text-slate-700">{settings?.companyName || 'My Bookstore'}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">{settings?.companyAddress || 'Main Branch'}</p>
                  <p className="text-[10px] text-slate-400">Phone: {settings?.companyPhone || 'N/A'}</p>
                  {settings?.gstNumber && <p className="text-[10px] text-slate-400">GSTIN: {settings.gstNumber}</p>}
                </div>

                {/* Metadata */}
                <div className="space-y-1 text-slate-500">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span className="font-bold text-slate-700">{customerName}</span>
                  </div>
                  {customerPhone && (
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span>{customerPhone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Payment:</span>
                    <span className="uppercase">{paymentMethod}</span>
                  </div>
                </div>

                {/* Items list */}
                <div className="border-t border-b border-dashed border-slate-300 py-3 space-y-2">
                  <div className="flex justify-between font-bold text-slate-700 text-[10px]">
                    <span className="w-1/2">Item Description</span>
                    <span className="w-1/6 text-center">Qty</span>
                    <span className="w-1/3 text-right">Total</span>
                  </div>
                  
                  {cart.map((item) => (
                    <div key={item.product._id} className="flex justify-between text-slate-500 text-[10px]">
                      <span className="w-1/2 truncate">{item.product.title}</span>
                      <span className="w-1/6 text-center">{item.quantity}</span>
                      <span className="w-1/3 text-right">₹{(item.quantity * item.product.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Calculations */}
                <div className="space-y-1.5 text-right font-medium text-slate-500">
                  <div>Subtotal: ₹{totals.subtotal.toFixed(2)}</div>
                  {totals.discountAmount > 0 && (
                    <div className="text-rose-500">Discount ({totals.discountPercent}%): -₹{totals.discountAmount.toFixed(2)}</div>
                  )}
                  <div>GST ({totals.gstPercent}%): ₹{totals.gstAmount.toFixed(2)}</div>
                  <div className="text-sm font-bold text-slate-800 pt-2 border-t border-dashed border-slate-200">
                    Grand Total: ₹{totals.totalAmount.toFixed(2)}
                  </div>
                </div>

              </div>

              {/* Invoice notes input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Receipt Notes / Terms
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Return within 7 days with invoice copy..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-medium focus:border-indigo-500 focus:bg-white outline-none resize-none"
                />
              </div>

            </div>

            {/* Footer triggers */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50 rounded-b-2xl">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckoutSubmit}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-lg shadow-indigo-600/10 rounded-xl transition-all cursor-pointer"
              >
                Generate Invoice
              </button>
            </div>

          </div>
        </div>
      )}

      {/* POST SUCCESS MODAL */}
      {isSuccessOpen && createdBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-slate-100 p-6 text-center space-y-6">
            
            <div className="flex justify-center text-emerald-500 animate-scale">
              <FiCheckCircle className="w-16 h-16" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800">Checkout Complete!</h3>
              <p className="text-xs text-slate-400 font-medium">Invoice <span className="font-bold text-slate-700">#{createdBill.billNumber}</span> generated successfully.</p>
              <p className="text-sm font-black text-indigo-600 pt-1">Grand Total: ₹{createdBill.totalAmount.toFixed(2)}</p>
            </div>

            {/* Printable Operations */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handlePrintPDF(createdBill)}
                className="flex items-center justify-center gap-2 py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer"
              >
                <FiPrinter className="w-4 h-4 text-indigo-600" />
                <span>Print PDF Invoice</span>
              </button>

              <button
                onClick={() => handleShareWhatsApp(createdBill._id)}
                className="flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-emerald-500/15 transition-all cursor-pointer"
              >
                <FiShare2 className="w-4 h-4" />
                <span>Share WhatsApp</span>
              </button>
            </div>

            <button
              onClick={() => {
                setIsSuccessOpen(false);
                setCreatedBill(null);
              }}
              className="w-full py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Back to POS Terminal
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default BillingForm;
