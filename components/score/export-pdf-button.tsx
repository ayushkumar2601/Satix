'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { generateScoreReportPDF } from '@/lib/utils/pdf-export'
import { useState } from 'react'

interface ExportPDFButtonProps {
  scoreData: {
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
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function ExportPDFButton({ 
  scoreData, 
  variant = 'outline', 
  size = 'default',
  className = '' 
}: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await generateScoreReportPDF(scoreData)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant={variant}
      size={size}
      className={className}
    >
      {isExporting ? (
        <>
          <span className="inline-block animate-spin mr-2">⟳</span>
          Generating...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Export as PDF
        </>
      )}
    </Button>
  )
}
