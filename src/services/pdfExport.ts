import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  orientation?: 'landscape' | 'portrait';
  filename: string;
}

/**
 * Exports an HTML element directly to an A4 PDF file and triggers automatic browser download.
 */
export async function exportElementToPdfA4(
  element: HTMLElement,
  options: PdfExportOptions
): Promise<void> {
  const orientation = options.orientation || 'landscape';
  const filename = options.filename.endsWith('.pdf')
    ? options.filename
    : `${options.filename}.pdf`;

  try {
    // Generate high-resolution canvas
    const canvas = await html2canvas(element, {
      scale: 2, // 2x scale for crisp text and logos
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      onclone: (clonedDoc) => {
        // Ensure cloned element is fully visible for snapshot
        const target = clonedDoc.getElementById(element.id);
        if (target) {
          target.style.transform = 'none';
          target.style.boxShadow = 'none';
          target.style.margin = '0 auto';
        }
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // A4 dimensions in mm
    const pageWidth = orientation === 'landscape' ? 297 : 210;
    const pageHeight = orientation === 'landscape' ? 210 : 297;
    const margin = 8; // 8mm margin
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const imgProps = pdf.getImageProperties(imgData);
    const renderedWidth = contentWidth;
    const renderedHeight = (imgProps.height * contentWidth) / imgProps.width;

    if (renderedHeight <= contentHeight) {
      // Single page document
      pdf.addImage(imgData, 'JPEG', margin, margin, renderedWidth, renderedHeight, undefined, 'FAST');
    } else {
      // Multi-page document handling
      let remainingHeight = renderedHeight;
      let yOffset = margin;
      let pageCount = 0;

      while (remainingHeight > 0) {
        if (pageCount > 0) {
          pdf.addPage('a4', orientation);
        }

        pdf.addImage(
          imgData,
          'JPEG',
          margin,
          yOffset,
          renderedWidth,
          renderedHeight,
          undefined,
          'FAST'
        );

        remainingHeight -= contentHeight;
        yOffset -= contentHeight;
        pageCount++;

        // Safety break against infinite loop
        if (pageCount > 30) break;
      }
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Gagal generate PDF via canvas, membuka print dialog fallback:', error);
    // Fallback if canvas capture fails
    window.print();
  }
}
