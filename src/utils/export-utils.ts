import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

// Brand colors
const BRAND_PRIMARY = '#4F46E5';
const BRAND_TEXT = '#1F2937';
const BRAND_LIGHT = '#EEF2FF';

/**
 * Create a branded PDF with header and footer
 */
export function createBrandedPDF(title: string, organizationName?: string): jsPDF {
  const doc = new jsPDF();
  
  // Add header with branding
  doc.setFillColor(BRAND_PRIMARY);
  doc.rect(0, 0, 210, 40, 'F');
  
  // DISCLOSURELY text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('DISCLOSURELY', 105, 12, { align: 'center' });
  
  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 105, 22, { align: 'center' });
  
  // Organization name
  if (organizationName) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(organizationName, 105, 30, { align: 'center' });
  }
  
  // Add footer with timestamp
  const pageCount = doc.internal.pages.length - 1;
  const timestamp = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated: ${timestamp}`, 14, 287);
  doc.text(`Page ${pageCount}`, 196, 287, { align: 'right' });
  
  // Reset text color for content
  doc.setTextColor(BRAND_TEXT);
  
  return doc;
}

/**
 * Add a section title to the PDF
 */
export function addPDFSection(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(BRAND_PRIMARY);
  doc.text(title, 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(BRAND_TEXT);
  return y + 8;
}

/**
 * Add a key-value pair to the PDF
 */
export function addPDFField(doc: jsPDF, label: string, value: string, y: number): number {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${label}:`, 14, y);
  doc.setFont('helvetica', 'normal');
  
  // Split long text into multiple lines
  const lines = doc.splitTextToSize(value || 'N/A', 120);
  doc.text(lines, 60, y);
  
  return y + (lines.length * 5) + 2;
}

/**
 * Export data as CSV file
 */
export function exportToCSV(data: any[], filename: string) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format date for exports
 */
export function formatExportDate(date: string | null): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format status with color indicator for PDF
 */
export function getStatusColor(status: string): [number, number, number] {
  const colors: Record<string, [number, number, number]> = {
    new: [239, 68, 68],      // red-500
    investigating: [59, 130, 246], // blue-500
    resolved: [34, 197, 94],  // green-500
    closed: [107, 114, 128],  // gray-500
    draft: [156, 163, 175],   // gray-400
    active: [34, 197, 94],    // green-500
    archived: [107, 114, 128], // gray-500
    completed: [34, 197, 94],  // green-500
    pending: [234, 179, 8],   // yellow-500
    overdue: [239, 68, 68],   // red-500
  };
  
  return colors[status.toLowerCase()] || [107, 114, 128];
}

/**
 * Format severity/priority color for PDF
 */
export function getSeverityColor(severity: string): [number, number, number] {
  const colors: Record<string, [number, number, number]> = {
    critical: [239, 68, 68],  // red-500
    high: [249, 115, 22],     // orange-500
    medium: [234, 179, 8],    // yellow-500
    low: [34, 197, 94],       // green-500
  };
  
  return colors[severity.toLowerCase()] || [107, 114, 128];
}

/**
 * Add a table to the PDF
 */
export function addPDFTable(
  doc: jsPDF,
  headers: string[],
  data: (string | number)[][],
  startY: number
) {
  autoTable(doc, {
    head: [headers],
    body: data,
    startY,
    theme: 'grid',
    headStyles: {
      fillColor: BRAND_PRIMARY,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: BRAND_TEXT
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    },
    margin: { left: 14, right: 14 }
  });
}

/**
 * Download PDF file
 */
export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(`${filename}.pdf`);
}

