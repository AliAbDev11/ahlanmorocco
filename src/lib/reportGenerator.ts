import { format } from 'date-fns';

interface ReportConfig {
  templateId: string;
  templateName: string;
  dateRange: { from: Date; to: Date };
  exportFormat: string;
}

function generateCSVContent(config: ReportConfig): string {
  const { templateId, dateRange } = config;
  const fromStr = format(dateRange.from, 'yyyy-MM-dd');
  const toStr = format(dateRange.to, 'yyyy-MM-dd');

  const headers: Record<string, string[]> = {
    'daily-operations': ['Date', 'Occupancy Rate', 'Check-ins', 'Check-outs', 'Revenue', 'Service Requests'],
    'weekly-occupancy': ['Week', 'Total Rooms', 'Occupied', 'Available', 'Occupancy %', 'Avg Rate'],
    'monthly-revenue': ['Month', 'Room Revenue', 'F&B Revenue', 'Service Revenue', 'Other Revenue', 'Total'],
    'guest-satisfaction': ['Category', 'Score', 'Total Reviews', 'Positive', 'Neutral', 'Negative'],
    'service-performance': ['Service Type', 'Total Requests', 'Avg Response Time', 'Resolved', 'Pending', 'Resolution Rate'],
    'complaint-analysis': ['Category', 'Total Complaints', 'Resolved', 'Pending', 'Avg Resolution Time', 'Satisfaction After'],
  };

  const sampleData: Record<string, string[][]> = {
    'daily-operations': [
      [fromStr, '78%', '12', '8', '$4,520', '15'],
      [format(new Date(dateRange.from.getTime() + 86400000), 'yyyy-MM-dd'), '82%', '15', '10', '$5,100', '12'],
      [format(new Date(dateRange.from.getTime() + 172800000), 'yyyy-MM-dd'), '85%', '18', '6', '$5,800', '9'],
    ],
    'weekly-occupancy': [
      ['Week 1', '120', '94', '26', '78%', '$185'],
      ['Week 2', '120', '102', '18', '85%', '$192'],
      ['Week 3', '120', '98', '22', '82%', '$188'],
    ],
    'monthly-revenue': [
      ['January', '$45,200', '$12,800', '$5,400', '$2,100', '$65,500'],
      ['February', '$48,900', '$14,200', '$6,100', '$2,400', '$71,600'],
      ['March', '$52,300', '$15,600', '$6,800', '$2,700', '$77,400'],
    ],
    'guest-satisfaction': [
      ['Room Quality', '4.5', '245', '198', '32', '15'],
      ['Staff Service', '4.7', '230', '210', '15', '5'],
      ['Food & Beverage', '4.3', '180', '142', '25', '13'],
      ['Cleanliness', '4.6', '220', '195', '18', '7'],
    ],
    'service-performance': [
      ['Housekeeping', '156', '12 min', '148', '8', '94.9%'],
      ['Room Service', '89', '18 min', '85', '4', '95.5%'],
      ['Maintenance', '42', '35 min', '38', '4', '90.5%'],
      ['Concierge', '67', '8 min', '65', '2', '97.0%'],
    ],
    'complaint-analysis': [
      ['Noise', '23', '19', '4', '2.5 hrs', '82%'],
      ['Cleanliness', '15', '14', '1', '1.8 hrs', '90%'],
      ['Service Delay', '18', '16', '2', '3.2 hrs', '78%'],
      ['Billing', '8', '8', '0', '4.1 hrs', '95%'],
    ],
  };

  const h = headers[templateId] || ['Column 1', 'Column 2', 'Column 3'];
  const d = sampleData[templateId] || [['Sample', 'Data', 'Row']];

  let csv = `Report: ${config.templateName}\nDate Range: ${fromStr} to ${toStr}\nGenerated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}\n\n`;
  csv += h.join(',') + '\n';
  d.forEach(row => { csv += row.join(',') + '\n'; });

  return csv;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function generateReport(config: ReportConfig): Promise<void> {
  // Simulate generation delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const safeName = config.templateName.replace(/\s+/g, '_').toLowerCase();
  const dateStr = format(new Date(), 'yyyyMMdd');
  const csvContent = generateCSVContent(config);

  switch (config.exportFormat) {
    case 'csv': {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, `${safeName}_${dateStr}.csv`);
      break;
    }
    case 'xlsx': {
      // Generate a simple CSV with .xlsx hint (real Excel would need a library)
      const blob = new Blob([csvContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      downloadBlob(blob, `${safeName}_${dateStr}.csv`);
      break;
    }
    case 'pdf':
    default: {
      // Generate a text-based report as downloadable file
      const textContent = csvContent.replace(/,/g, '\t\t');
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
      downloadBlob(blob, `${safeName}_${dateStr}.txt`);
      break;
    }
  }
}

export function downloadRecentReport(reportName: string, reportFormat: string): void {
  const safeName = reportName.replace(/\s+/g, '_').toLowerCase();
  const content = `Report: ${reportName}\nFormat: ${reportFormat}\nDownloaded: ${format(new Date(), 'yyyy-MM-dd HH:mm')}\n\nThis is a previously generated report file.`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  downloadBlob(blob, `${safeName}.${reportFormat.toLowerCase() === 'excel' ? 'csv' : reportFormat.toLowerCase()}`);
}
