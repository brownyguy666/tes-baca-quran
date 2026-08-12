import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/**
 * Generate and download a PDF certificate from a hidden DOM element.
 *
 * @param {string} elementId   - ID of the hidden div containing the certificate HTML
 * @param {string} filename    - Output filename (without .pdf)
 */
export async function generateCertificatePDF(elementId, filename = 'sertifikat-quran') {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(`Element #${elementId} not found. Make sure CertificateTemplate is mounted.`)
  }

  // Temporarily make visible for capture
  const prevStyle = element.style.cssText
  element.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    visibility: visible;
    opacity: 1;
    width: 1122px;
    height: 794px;
    z-index: -1;
  `

  try {
    const canvas = await html2canvas(element, {
      scale: 2,           // 2x for sharp print quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#fdf8f0',
      logging: false,
      width: 1122,
      height: 794,
      windowWidth: 1122,
      windowHeight: 794,
    })

    // A4 landscape: 297mm × 210mm
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()   // 297
    const pageHeight = pdf.internal.pageSize.getHeight() // 210

    const imgData = canvas.toDataURL('image/png', 1.0)

    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST')
    pdf.save(`${filename}.pdf`)
  } finally {
    element.style.cssText = prevStyle
  }
}
