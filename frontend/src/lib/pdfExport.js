import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { getMoodConfig } from '@/components/MoodPicker';

/**
 * Export a diary entry to a beautifully formatted PDF
 */
export const exportEntryToPDF = (entry) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Header - Dark cyan bar
  pdf.setFillColor(0, 229, 255);
  pdf.rect(0, 0, pageWidth, 4, 'F');

  // Logo/Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(11, 14, 20);
  pdf.text('AETHER DIARY', margin, 15);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 120);
  pdf.text('A Private Journal Entry', margin, 20);

  // Date on right
  const dateStr = format(new Date(entry.created_at), 'MMMM dd, yyyy');
  pdf.setFontSize(9);
  pdf.setTextColor(80, 80, 80);
  pdf.text(dateStr, pageWidth - margin, 15, { align: 'right' });

  const timeStr = format(new Date(entry.created_at), 'h:mm a');
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(timeStr, pageWidth - margin, 20, { align: 'right' });

  // Horizontal line
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.3);
  pdf.line(margin, 28, pageWidth - margin, 28);

  let yPos = 45;

  // Title (serif style)
  pdf.setFont('times', 'bold');
  pdf.setFontSize(24);
  pdf.setTextColor(20, 20, 20);
  const titleLines = pdf.splitTextToSize(entry.title, contentWidth);
  pdf.text(titleLines, margin, yPos);
  yPos += titleLines.length * 9 + 6;

  // Mood badge
  if (entry.mood && entry.mood !== 'neutral') {
    const mood = getMoodConfig(entry.mood);
    // Parse cyan color to RGB
    const r = parseInt(mood.color.slice(1, 3), 16);
    const g = parseInt(mood.color.slice(3, 5), 16);
    const b = parseInt(mood.color.slice(5, 7), 16);
    
    pdf.setFillColor(r, g, b, 0.15);
    pdf.setDrawColor(r, g, b);
    pdf.setLineWidth(0.3);
    const badgeText = `${mood.emoji} ${mood.label.toUpperCase()}`;
    const badgeWidth = pdf.getTextWidth(badgeText) + 8;
    pdf.roundedRect(margin, yPos - 4, badgeWidth, 6, 2, 2, 'FD');
    pdf.setFontSize(8);
    pdf.setTextColor(r, g, b);
    pdf.setFont('helvetica', 'bold');
    pdf.text(badgeText, margin + 4, yPos);
    yPos += 12;
  }

  // Tags
  if (entry.tags && entry.tags.length > 0) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    const tagStr = entry.tags.map(t => `#${t}`).join('  ');
    pdf.text(tagStr, margin, yPos);
    yPos += 8;
  }

  // Divider
  pdf.setDrawColor(240, 240, 240);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Image if present
  if (entry.image_url && entry.image_url.startsWith('data:image')) {
    try {
      const imgWidth = contentWidth;
      const imgHeight = 60;
      pdf.addImage(entry.image_url, 'JPEG', margin, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 8;
    } catch (e) {
      console.error('Failed to add image to PDF:', e);
    }
  }

  // Content
  pdf.setFont('times', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(40, 40, 40);
  const contentLines = pdf.splitTextToSize(entry.content, contentWidth);
  
  contentLines.forEach((line) => {
    if (yPos > pageHeight - 25) {
      pdf.addPage();
      yPos = 25;
    }
    pdf.text(line, margin, yPos);
    yPos += 6;
  });

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(180, 180, 180);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Exported from Aether Diary', pageWidth / 2, pageHeight - 8, { align: 'center' });

  // Cyan footer bar
  pdf.setFillColor(0, 229, 255);
  pdf.rect(0, pageHeight - 4, pageWidth, 4, 'F');

  // Download
  const safeTitle = entry.title.replace(/[^a-z0-9]/gi, '_').slice(0, 40);
  const dateForFile = format(new Date(entry.created_at), 'yyyy-MM-dd');
  pdf.save(`diary-${dateForFile}-${safeTitle}.pdf`);
};
