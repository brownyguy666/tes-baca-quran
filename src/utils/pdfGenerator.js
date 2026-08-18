import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/**
 * Generate and download a high-precision PDF certificate from a DOM element.
 * Ensures proper font, image, and layout rendering without misalignment.
 *
 * @param {string} elementId   - ID of the div containing the certificate HTML
 * @param {string} filename    - Output filename (without .pdf)
 */
export async function generateCertificatePDF(elementId, filename = 'sertifikat-quran') {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(`Element #${elementId} not found. Pastikan komponen sertifikat telah dimuat.`)
  }

  // Save previous styling
  const prevDisplay = element.style.display
  const prevVisibility = element.style.visibility
  const prevPosition = element.style.position
  const prevLeft = element.style.left
  const prevTop = element.style.top
  const prevZIndex = element.style.zIndex
  const prevOpacity = element.style.opacity

  // Temporarily bring to top-left of viewport for pixel-perfect html2canvas layout calculation
  element.style.display = 'block'
  element.style.visibility = 'visible'
  element.style.position = 'fixed'
  element.style.left = '0px'
  element.style.top = '0px'
  element.style.zIndex = '999999'
  element.style.opacity = '1'

  // Allow DOM to settle and load web fonts
  await new Promise((resolve) => setTimeout(resolve, 150))

  try {
    const canvas = await html2canvas(element, {
      scale: 2.5,          // 2.5x high DPI for crisp print quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#fffef9',
      logging: false,
      width: 1122,
      height: 794,
      windowWidth: 1122,
      windowHeight: 794,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
    })

    // A4 landscape: 297mm × 210mm
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    })

    const pageWidth = pdf.internal.pageSize.getWidth()   // 297 mm
    const pageHeight = pdf.internal.pageSize.getHeight() // 210 mm

    const imgData = canvas.toDataURL('image/png', 1.0)
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST')
    pdf.save(`${filename}.pdf`)
  } finally {
    // Restore previous styling
    element.style.display = prevDisplay
    element.style.visibility = prevVisibility
    element.style.position = prevPosition
    element.style.left = prevLeft
    element.style.top = prevTop
    element.style.zIndex = prevZIndex
    element.style.opacity = prevOpacity
  }
}
