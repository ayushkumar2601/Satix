import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ScoreData {
  trust_score: number
  score_breakdown: {
    utility_score: number
    upi_score: number
    location_score: number
    social_score: number
  }
  explanations: {
    utility: string
    upi: string
    location: string
    social: string
  }
  eligibility: {
    min_loan: number
    max_loan: number
    interest_rate: number
  }
  profile?: {
    full_name?: string
    email?: string
  }
}

export function generateScoreReportPDF(data: ScoreData) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Header
  doc.setFillColor(240, 235, 220) // Cream color
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('SATIX', 20, 20)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Trust Score Report', 20, 28)
  doc.text(new Date().toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), pageWidth - 20, 28, { align: 'right' })
  
  let yPos = 50
  
  // User Info
  if (data.profile?.full_name) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Report For:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(data.profile.full_name, 50, yPos)
    yPos += 6
    if (data.profile.email) {
      doc.text(data.profile.email, 50, yPos)
      yPos += 10
    }
  }
  
  yPos += 5
  
  // Trust Score - Large Display
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(20, yPos, pageWidth - 40, 35, 3, 3, 'F')
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Your Trust Score', pageWidth / 2, yPos + 12, { align: 'center' })
  
  doc.setFontSize(36)
  const scoreColor = getScoreColor(data.trust_score)
  doc.setTextColor(scoreColor.r, scoreColor.g, scoreColor.b)
  doc.text(data.trust_score.toString(), pageWidth / 2, yPos + 28, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`(Range: 300-900)`, pageWidth / 2, yPos + 33, { align: 'center' })
  
  yPos += 45
  
  // Score Breakdown Table
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Score Breakdown', 20, yPos)
  yPos += 5
  
  const breakdownData = [
    ['Utility Bills', `${(data.score_breakdown.utility_score * 100).toFixed(0)}%`, '35%', data.explanations.utility],
    ['UPI Transactions', `${(data.score_breakdown.upi_score * 100).toFixed(0)}%`, '35%', data.explanations.upi],
    ['Location Stability', `${(data.score_breakdown.location_score * 100).toFixed(0)}%`, '20%', data.explanations.location],
    ['Social Trust', `${(data.score_breakdown.social_score * 100).toFixed(0)}%`, '10%', data.explanations.social],
  ]
  
  autoTable(doc, {
    startY: yPos,
    head: [['Category', 'Score', 'Weight', 'Explanation']],
    body: breakdownData,
    theme: 'striped',
    headStyles: { fillColor: [50, 50, 50], fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 95 }
    },
    margin: { left: 20, right: 20 }
  })
  
  yPos = (doc as any).lastAutoTable.finalY + 15
  
  // Loan Eligibility
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Loan Eligibility', 20, yPos)
  yPos += 5
  
  const eligibilityData = [
    ['Minimum Loan Amount', `₹${data.eligibility.min_loan.toLocaleString('en-IN')}`],
    ['Maximum Loan Amount', `₹${data.eligibility.max_loan.toLocaleString('en-IN')}`],
    ['Interest Rate', `${data.eligibility.interest_rate}% per annum`],
  ]
  
  autoTable(doc, {
    startY: yPos,
    body: eligibilityData,
    theme: 'plain',
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 90, halign: 'right' }
    },
    margin: { left: 20, right: 20 }
  })
  
  yPos = (doc as any).lastAutoTable.finalY + 15
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 30
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(100, 100, 100)
  doc.text('This report is generated based on your financial behavior and alternative credit data.', pageWidth / 2, footerY, { align: 'center' })
  doc.text('Trust scores are calculated using AI-powered analysis and may change over time.', pageWidth / 2, footerY + 5, { align: 'center' })
  doc.text('For questions, contact support@satix.com', pageWidth / 2, footerY + 10, { align: 'center' })
  
  // Page border
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.rect(10, 10, pageWidth - 20, doc.internal.pageSize.getHeight() - 20)
  
  // Save PDF
  const fileName = `Satix_Trust_Score_Report_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

function getScoreColor(score: number): { r: number; g: number; b: number } {
  if (score >= 750) return { r: 34, g: 197, b: 94 } // Green
  if (score >= 650) return { r: 59, g: 130, b: 246 } // Blue
  if (score >= 550) return { r: 251, g: 191, b: 36 } // Yellow
  return { r: 239, g: 68, b: 68 } // Red
}
