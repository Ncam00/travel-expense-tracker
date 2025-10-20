import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate a comprehensive PDF trip report
 * @param {Object} trip - Trip data including id, name, dates, budget
 * @param {Array} expenses - Array of expense objects for this trip
 * @param {Array} members - Array of trip members (optional)
 * @returns {void} - Downloads PDF file
 */
export const generateTripPDF = (trip, expenses = [], members = []) => {
  try {
    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace = 20) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    // ============ HEADER SECTION ============
    // Add title with gradient effect (using colors)
    doc.setFillColor(99, 102, 241); // Indigo
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('✈️ Trip Report', pageWidth / 2, 25, { align: 'center' });
    
    yPosition = 50;

    // ============ TRIP DETAILS SECTION ============
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(trip.name || 'Unnamed Trip', 14, yPosition);
    yPosition += 10;

    // Trip metadata
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const startDate = trip.startDate ? 
      (trip.startDate.toDate ? trip.startDate.toDate() : new Date(trip.startDate)) : 
      new Date();
    const endDate = trip.endDate ? 
      (trip.endDate.toDate ? trip.endDate.toDate() : new Date(trip.endDate)) : 
      new Date();

    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    doc.text(`📅 Dates: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()} (${duration} days)`, 14, yPosition);
    yPosition += 6;
    
    doc.text(`💰 Budget: ${trip.currency || 'USD'} ${(trip.totalBudget || 0).toFixed(2)}`, 14, yPosition);
    yPosition += 6;

    if (trip.destination) {
      doc.text(`📍 Destination: ${trip.destination}`, 14, yPosition);
      yPosition += 6;
    }

    if (members && members.length > 0) {
      doc.text(`👥 Travelers: ${members.length} member${members.length > 1 ? 's' : ''}`, 14, yPosition);
      yPosition += 8;
    } else {
      yPosition += 8;
    }

    // ============ FINANCIAL SUMMARY ============
    checkPageBreak(40);
    
    doc.setFillColor(243, 244, 246); // Light gray
    doc.rect(14, yPosition, pageWidth - 28, 30, 'F');
    
    yPosition += 8;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Financial Summary', 18, yPosition);
    yPosition += 8;

    const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    const remaining = (trip.totalBudget || 0) - totalSpent;
    const percentUsed = trip.totalBudget > 0 ? (totalSpent / trip.totalBudget * 100).toFixed(1) : 0;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Spent: ${trip.currency || 'USD'} ${totalSpent.toFixed(2)}`, 18, yPosition);
    yPosition += 5;
    doc.text(`Remaining: ${trip.currency || 'USD'} ${remaining.toFixed(2)}`, 18, yPosition);
    yPosition += 5;
    doc.text(`Budget Used: ${percentUsed}%`, 18, yPosition);
    yPosition += 12;

    // ============ EXPENSE BREAKDOWN BY CATEGORY ============
    checkPageBreak(50);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Spending by Category', 14, yPosition);
    yPosition += 8;

    // Calculate category totals
    const categoryTotals = {};
    expenses.forEach(exp => {
      const category = exp.category || 'other';
      categoryTotals[category] = (categoryTotals[category] || 0) + Number(exp.amount || 0);
    });

    // Create category table
    const categoryData = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => {
        const percentage = totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(1) : 0;
        return [
          category.charAt(0).toUpperCase() + category.slice(1),
          `${trip.currency || 'USD'} ${amount.toFixed(2)}`,
          `${percentage}%`
        ];
      });

    doc.autoTable({
      startY: yPosition,
      head: [['Category', 'Amount', '% of Total']],
      body: categoryData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 }
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // ============ DETAILED EXPENSE LIST ============
    checkPageBreak(50);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Expenses', 14, yPosition);
    yPosition += 8;

    // Prepare expense data
    const expenseData = expenses
      .sort((a, b) => {
        const dateA = a.date?.seconds ? a.date.seconds * 1000 : new Date(a.date).getTime();
        const dateB = b.date?.seconds ? b.date.seconds * 1000 : new Date(b.date).getTime();
        return dateA - dateB;
      })
      .map(exp => {
        const expDate = exp.date?.toDate ? exp.date.toDate() : new Date(exp.date);
        return [
          expDate.toLocaleDateString(),
          (exp.description || 'No description').substring(0, 30),
          exp.category || 'other',
          exp.location?.name || '-',
          `${trip.currency || 'USD'} ${Number(exp.amount || 0).toFixed(2)}`
        ];
      });

    doc.autoTable({
      startY: yPosition,
      head: [['Date', 'Description', 'Category', 'Location', 'Amount']],
      body: expenseData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241], fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 50 },
        2: { cellWidth: 25 },
        3: { cellWidth: 40 },
        4: { cellWidth: 30, halign: 'right' }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // ============ DAILY SPENDING CHART (Text-based) ============
    checkPageBreak(50);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Daily Spending Pattern', 14, yPosition);
    yPosition += 8;

    // Group expenses by date
    const dailySpending = {};
    expenses.forEach(exp => {
      const expDate = exp.date?.toDate ? exp.date.toDate() : new Date(exp.date);
      const dateKey = expDate.toLocaleDateString();
      dailySpending[dateKey] = (dailySpending[dateKey] || 0) + Number(exp.amount || 0);
    });

    const dailyData = Object.entries(dailySpending)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, amount]) => [
        date,
        `${trip.currency || 'USD'} ${amount.toFixed(2)}`
      ]);

    if (dailyData.length > 0) {
      doc.autoTable({
        startY: yPosition,
        head: [['Date', 'Total Spent']],
        body: dailyData,
        theme: 'plain',
        headStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: 'bold' },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 9 }
      });
      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // ============ FOOTER ============
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text('Travel Expense Tracker', 14, pageHeight - 10);
    }

    // ============ SAVE PDF ============
    const fileName = `${trip.name || 'trip'}_report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};

/**
 * Generate a simple expense summary PDF
 * @param {Array} expenses - Array of expense objects
 * @param {String} title - Title for the report
 * @returns {void} - Downloads PDF file
 */
export const generateExpensesSummaryPDF = (expenses, title = 'Expense Summary') => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text(title, pageWidth / 2, 20, { align: 'center' });
    
    // Expenses table
    const expenseData = expenses.map(exp => {
      const expDate = exp.date?.toDate ? exp.date.toDate() : new Date(exp.date);
      return [
        expDate.toLocaleDateString(),
        exp.description || 'No description',
        exp.category || '-',
        `${exp.currency || 'USD'} ${Number(exp.amount || 0).toFixed(2)}`
      ];
    });

    doc.autoTable({
      startY: 40,
      head: [['Date', 'Description', 'Category', 'Amount']],
      body: expenseData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] }
    });

    const fileName = `expenses_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating expenses PDF:', error);
    throw new Error('Failed to generate expenses PDF');
  }
};
