/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Array of header names/keys
 * @returns {String} - CSV formatted string
 */
const arrayToCSV = (data, headers) => {
  if (!data || data.length === 0) {
    return '';
  }

  // Create header row
  const headerRow = headers.map(h => `"${h.label}"`).join(',');
  
  // Create data rows
  const dataRows = data.map(item => {
    return headers.map(h => {
      let value = item[h.key];
      
      // Handle different data types
      if (value === null || value === undefined) {
        value = '';
      } else if (typeof value === 'object') {
        // Handle dates
        if (value.toDate) {
          value = value.toDate().toLocaleDateString();
        } else if (value instanceof Date) {
          value = value.toLocaleDateString();
        } else {
          value = JSON.stringify(value);
        }
      } else if (typeof value === 'string') {
        // Escape quotes in strings
        value = value.replace(/"/g, '""');
      }
      
      return `"${value}"`;
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
};

/**
 * Download CSV file
 * @param {String} csvContent - CSV formatted string
 * @param {String} fileName - Name of the file to download
 */
const downloadCSV = (csvContent, fileName) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, fileName);
  } else {
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Export expenses to CSV file
 * @param {Array} expenses - Array of expense objects
 * @param {String} fileName - Optional custom file name
 * @returns {Object} - Success status and file name
 */
export const exportExpensesToCSV = (expenses, fileName = null) => {
  try {
    if (!expenses || expenses.length === 0) {
      throw new Error('No expenses to export');
    }

    // Define CSV headers and corresponding data keys
    const headers = [
      { label: 'Date', key: 'date' },
      { label: 'Description', key: 'description' },
      { label: 'Amount', key: 'amount' },
      { label: 'Currency', key: 'currency' },
      { label: 'Category', key: 'category' },
      { label: 'Location', key: 'locationName' },
      { label: 'Coordinates', key: 'coordinates' },
      { label: 'Transport Mode', key: 'transportMode' },
      { label: 'Paid By', key: 'paidBy' },
      { label: 'Split Between', key: 'splitBetween' },
      { label: 'Trip ID', key: 'tripId' },
      { label: 'Receipt', key: 'receiptURL' },
      { label: 'Notes', key: 'notes' }
    ];

    // Transform expenses data for CSV
    const csvData = expenses.map(exp => {
      const expDate = exp.date?.toDate ? exp.date.toDate() : new Date(exp.date);
      
      return {
        date: expDate,
        description: exp.description || '',
        amount: Number(exp.amount || 0).toFixed(2),
        currency: exp.currency || 'USD',
        category: exp.category || '',
        locationName: exp.location?.name || '',
        coordinates: exp.location?.coordinates 
          ? `${exp.location.coordinates.lat},${exp.location.coordinates.lng}` 
          : '',
        transportMode: exp.transportMode || '',
        paidBy: exp.paidBy || '',
        splitBetween: Array.isArray(exp.splitBetween) ? exp.splitBetween.join('; ') : '',
        tripId: exp.tripId || '',
        receiptURL: exp.receiptURL || '',
        notes: exp.notes || ''
      };
    });

    // Generate CSV content
    const csvContent = arrayToCSV(csvData, headers);

    // Generate file name
    const defaultFileName = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    const finalFileName = fileName || defaultFileName;

    // Download file
    downloadCSV(csvContent, finalFileName);

    return { 
      success: true, 
      fileName: finalFileName,
      recordCount: expenses.length 
    };
  } catch (error) {
    console.error('Error exporting expenses to CSV:', error);
    throw new Error(error.message || 'Failed to export expenses to CSV');
  }
};

/**
 * Export trip summary to CSV file
 * @param {Object} trip - Trip object
 * @param {Array} expenses - Array of expenses for this trip
 * @param {Array} members - Array of trip members
 * @returns {Object} - Success status and file name
 */
export const exportTripSummaryToCSV = (trip, expenses = [], members = []) => {
  try {
    // Calculate summary statistics
    const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    const categoryTotals = {};
    const dailySpending = {};

    expenses.forEach(exp => {
      // Category totals
      const category = exp.category || 'other';
      categoryTotals[category] = (categoryTotals[category] || 0) + Number(exp.amount || 0);

      // Daily spending
      const expDate = exp.date?.toDate ? exp.date.toDate() : new Date(exp.date);
      const dateKey = expDate.toLocaleDateString();
      dailySpending[dateKey] = (dailySpending[dateKey] || 0) + Number(exp.amount || 0);
    });

    // Create summary data
    const summaryData = [
      { field: 'Trip Name', value: trip.name || 'Unnamed Trip' },
      { field: 'Start Date', value: trip.startDate ? (trip.startDate.toDate ? trip.startDate.toDate() : new Date(trip.startDate)).toLocaleDateString() : '' },
      { field: 'End Date', value: trip.endDate ? (trip.endDate.toDate ? trip.endDate.toDate() : new Date(trip.endDate)).toLocaleDateString() : '' },
      { field: 'Budget', value: `${trip.currency || 'USD'} ${(trip.totalBudget || 0).toFixed(2)}` },
      { field: 'Total Spent', value: `${trip.currency || 'USD'} ${totalSpent.toFixed(2)}` },
      { field: 'Remaining', value: `${trip.currency || 'USD'} ${((trip.totalBudget || 0) - totalSpent).toFixed(2)}` },
      { field: 'Number of Expenses', value: expenses.length },
      { field: 'Number of Members', value: members.length },
      { field: '', value: '' }, // Empty row
      { field: '=== SPENDING BY CATEGORY ===', value: '' }
    ];

    // Add category breakdown
    Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, amount]) => {
        const percentage = totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(1) : 0;
        summaryData.push({
          field: category.charAt(0).toUpperCase() + category.slice(1),
          value: `${trip.currency || 'USD'} ${amount.toFixed(2)} (${percentage}%)`
        });
      });

    summaryData.push({ field: '', value: '' }); // Empty row
    summaryData.push({ field: '=== DAILY SPENDING ===', value: '' });

    // Add daily spending
    Object.entries(dailySpending)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .forEach(([date, amount]) => {
        summaryData.push({
          field: date,
          value: `${trip.currency || 'USD'} ${amount.toFixed(2)}`
        });
      });

    // Generate CSV
    const headers = [
      { label: 'Field', key: 'field' },
      { label: 'Value', key: 'value' }
    ];

    const csvContent = arrayToCSV(summaryData, headers);
    const fileName = `${trip.name || 'trip'}_summary_${new Date().toISOString().split('T')[0]}.csv`;

    downloadCSV(csvContent, fileName);

    return { 
      success: true, 
      fileName: fileName 
    };
  } catch (error) {
    console.error('Error exporting trip summary to CSV:', error);
    throw new Error('Failed to export trip summary to CSV');
  }
};

/**
 * Export debt settlements to CSV
 * @param {Array} settlements - Array of settlement objects
 * @param {String} tripName - Name of the trip (optional)
 * @returns {Object} - Success status and file name
 */
export const exportSettlementsToCSV = (settlements, tripName = '') => {
  try {
    if (!settlements || settlements.length === 0) {
      throw new Error('No settlements to export');
    }

    const headers = [
      { label: 'From', key: 'from' },
      { label: 'To', key: 'to' },
      { label: 'Amount', key: 'amount' },
      { label: 'Currency', key: 'currency' },
      { label: 'Status', key: 'status' },
      { label: 'Settled Date', key: 'settledDate' },
      { label: 'Notes', key: 'notes' }
    ];

    const csvData = settlements.map(settlement => ({
      from: settlement.fromName || settlement.from || '',
      to: settlement.toName || settlement.to || '',
      amount: Number(settlement.amount || 0).toFixed(2),
      currency: settlement.currency || 'USD',
      status: settlement.settled ? 'Settled' : 'Pending',
      settledDate: settlement.settledAt 
        ? (settlement.settledAt.toDate ? settlement.settledAt.toDate() : new Date(settlement.settledAt)).toLocaleDateString()
        : '',
      notes: settlement.notes || ''
    }));

    const csvContent = arrayToCSV(csvData, headers);
    const fileName = `${tripName ? tripName + '_' : ''}settlements_${new Date().toISOString().split('T')[0]}.csv`;

    downloadCSV(csvContent, fileName);

    return { 
      success: true, 
      fileName: fileName,
      recordCount: settlements.length 
    };
  } catch (error) {
    console.error('Error exporting settlements to CSV:', error);
    throw new Error('Failed to export settlements to CSV');
  }
};
