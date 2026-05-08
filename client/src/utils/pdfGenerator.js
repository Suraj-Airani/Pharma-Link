import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Generate a pharmacy invoice PDF
export const generateInvoicePDF = (saleData) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PharmaLink', 14, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Pharmacy Management System', 14, 28);

    // Invoice details
    doc.setFontSize(11);
    doc.setTextColor(40);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 150, 22);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${saleData.saleId}`, 150, 30);
    doc.text(`Date: ${saleData.date}`, 150, 36);

    // Separator line
    doc.setDrawColor(110, 172, 218);
    doc.setLineWidth(0.5);
    doc.line(14, 42, 196, 42);

    // Items table
    const tableData = saleData.items.map((item, index) => [
        index + 1,
        item.name,
        item.quantity,
        `Rs.${item.unitPrice.toFixed(2)}`,
        `Rs.${item.total.toFixed(2)}`,
    ]);

    autoTable(doc, {
        startY: 48,
        head: [['#', 'Medicine', 'Qty', 'Unit Price', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [3, 52, 110],
            textColor: [226, 226, 182],
            fontStyle: 'bold',
            fontSize: 9,
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [50, 50, 50],
        },
        alternateRowStyles: {
            fillColor: [240, 245, 250],
        },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 35, halign: 'right' },
            4: { cellWidth: 35, halign: 'right' },
        },
        margin: { left: 14, right: 14 },
    });

    // Total
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setDrawColor(110, 172, 218);
    doc.setLineWidth(0.3);
    doc.line(120, finalY, 196, finalY);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(3, 52, 110);
    doc.text('Total Amount:', 120, finalY + 8);
    doc.text(`Rs.${saleData.totalAmount.toFixed(2)}`, 196, finalY + 8, { align: 'right' });

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(140);
    doc.text('Thank you for your purchase!', 105, pageHeight - 20, { align: 'center' });
    doc.text('PharmaLink — Pharmacy Management System', 105, pageHeight - 14, { align: 'center' });

    // Save the PDF
    doc.save(`PharmaLink_Invoice_${saleData.saleId}.pdf`);
};
