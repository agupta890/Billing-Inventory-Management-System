import { jsPDF } from 'jspdf';

export const generateBillPDF = (bill, settings = {}) => {
  const doc = new jsPDF();
  const companyName = settings.companyName || 'My Bookstore';
  const companyAddress = settings.companyAddress || '123 Main Street, City';
  const companyPhone = settings.companyPhone || '9876543210';
  const companyEmail = settings.companyEmail || 'info@bookstore.com';
  const gstNumber = settings.gstNumber || '';

  // Header background block
  doc.setFillColor(243, 244, 246);
  doc.rect(0, 0, 210, 45, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229); // Indigo-600
  doc.text(companyName, 15, 20);

  // Invoice label
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text('INVOICE', 195, 20, { align: 'right' });

  // Company Details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(companyAddress, 15, 28);
  doc.text(`Phone: ${companyPhone} | Email: ${companyEmail}`, 15, 33);
  if (gstNumber) {
    doc.text(`GSTIN: ${gstNumber}`, 15, 38);
  }

  // Invoice metadata
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Bill No: ${bill.billNumber}`, 195, 28, { align: 'right' });
  doc.text(`Date: ${new Date(bill.billDate).toLocaleDateString()}`, 195, 33, { align: 'right' });
  doc.text(`Payment: ${bill.paymentMethod.toUpperCase()} (${bill.paymentStatus.toUpperCase()})`, 195, 38, { align: 'right' });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, 50, 195, 50);

  // Customer Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('Billed To:', 15, 58);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Name: ${bill.customerName}`, 15, 63);
  if (bill.customerPhone) doc.text(`Phone: ${bill.customerPhone}`, 15, 68);
  if (bill.customerEmail) doc.text(`Email: ${bill.customerEmail}`, 15, 73);

  // Table Header
  let y = 85;
  doc.setFillColor(79, 70, 229);
  doc.rect(15, y, 180, 8, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Book Name', 18, y + 5.5);
  doc.text('Qty', 115, y + 5.5, { align: 'center' });
  doc.text('Unit Price', 145, y + 5.5, { align: 'right' });
  doc.text('Total', 190, y + 5.5, { align: 'right' });

  // Items rows
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8.5);

  bill.items.forEach((item, index) => {
    y += 8;
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y, 180, 8, 'F');
    }
    
    doc.text(item.productName, 18, y + 5.5);
    doc.text(item.quantity.toString(), 115, y + 5.5, { align: 'center' });
    doc.text(`Rs. ${item.unitPrice.toFixed(2)}`, 145, y + 5.5, { align: 'right' });
    doc.text(`Rs. ${item.total.toFixed(2)}`, 190, y + 5.5, { align: 'right' });
  });

  // Table bottom line
  y += 8;
  doc.setDrawColor(226, 232, 240);
  doc.line(15, y, 195, y);

  // Totals Panel
  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', 140, y, { align: 'right' });
  doc.text(`Rs. ${bill.subtotal.toFixed(2)}`, 190, y, { align: 'right' });

  if (bill.discountAmount > 0) {
    y += 6;
    doc.text(`Discount (${bill.discountPercent}%):`, 140, y, { align: 'right' });
    doc.text(`-Rs. ${bill.discountAmount.toFixed(2)}`, 190, y, { align: 'right' });
  }

  y += 6;
  doc.text(`GST (${bill.gstPercent}%):`, 140, y, { align: 'right' });
  doc.text(`Rs. ${bill.gstAmount.toFixed(2)}`, 190, y, { align: 'right' });

  // Grand Total
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Grand Total:', 140, y, { align: 'right' });
  doc.text(`Rs. ${bill.totalAmount.toFixed(2)}`, 190, y, { align: 'right' });

  // Footer notes
  y += 20;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Thank you for your purchase! Please come again.', 105, y, { align: 'center' });
  if (bill.notes) {
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(`Notes: ${bill.notes}`, 15, y);
  }

  // Save PDF
  doc.save(`${bill.billNumber}.pdf`);
};
