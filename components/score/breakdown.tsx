'use client'

import React from "react"

import { useState } from 'react'
import { BarChart3, TrendingUp, MapPin, Users } from 'lucide-react'

interface BreakdownFactor {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  stars: number
  shortExplanation: string
  dataUsed: string[]
  impact: number
}

interface ScoreBreakdownProps {
  scores?: {
    utility_score: number
    upi_score: number
    location_score: number
    social_score: number
  }
  explanations?: {
    utility: string
    upi: string
    location: string
    social: string
  }
}

export function ScoreBreakdown({ scores, explanations }: ScoreBreakdownProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Convert 0-1 scores to 1-5 stars
  const scoreToStars = (score: number) => Math.max(1, Math.min(5, Math.round(score * 5)))

  // Convert 0-1 scores to percentage impact
  const scoreToImpact = (score: number, baseWeight: number) => 
    Math.round(score * baseWeight)

  const factors: BreakdownFactor[] = [
    {
      id: 'utility',
      title: 'Utility Discipline',
      icon: BarChart3,
      stars: scores ? scoreToStars(scores.utility_score) : 4,
      shortExplanation: explanations?.utility || 'Consistent on-time utility bill payments',
      dataUsed: ['Electricity bills', 'Water bills', 'Gas receipts', 'Payment history'],
      impact: scores ? scoreToImpact(scores.utility_score, 35) : 35
    },
    {
      id: 'upi',
      title: 'UPI Stability',
      icon: TrendingUp,
      stars: scores ? scoreToStars(scores.upi_score) : 5,
      shortExplanation: explanations?.upi || 'Predictable transaction flow with low volatility',
      dataUsed: ['UPI transactions', 'Payment frequency', 'Transaction patterns', 'Income consistency'],
      impact: scores ? scoreToImpact(scores.upi_score, 35) : 35
    },
    {
      id: 'location',
      title: 'Location Stability',
      icon: MapPin,
      stars: scores ? scoreToStars(scores.location_score) : 4,
      shortExplanation: explanations?.location || 'Stable residential pattern over time',
      dataUsed: ['Address verification', 'Residential duration', 'Location consistency'],
      impact: scores ? scoreToImpact(scores.location_score, 20) : 20
    },
    {
      id: 'social',
      title: 'Social Trust',
      icon: Users,
      stars: scores ? scoreToStars(scores.social_score) : 3,
      shortExplanation: explanations?.social || 'Connected to long-standing trusted contacts',
      dataUsed: ['Contact verification', 'Network analysis', 'Community standing', 'Referrals'],
      impact: scores ? scoreToImpact(scores.social_score, 10) : 10
    }
  ]

  const isExpanded = (id: string) => expandedId === id
  const toggleExpanded = (id: string) => {
    setExpandedId(isExpanded(id) ? null : id)
  }

  return (
    <div className="mt-12 md:mt-16 pt-8 md:pt-12 border-t border-border/30">
      {/* Section Title */}
      <div className="mb-8 md:mb-10 animate-fade-up">
        <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tight text-balance mb-3">
          Why You Got This Trust Score
        </h2>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          We analyze multiple factors from your financial behavior to build your score. Click any factor to see details.
        </p>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {factors.map((factor, idx) => {
          const Icon = factor.icon
          const expanded = isExpanded(factor.id)

          return (
            <button
              key={factor.id}
              type="button"
              onClick={() => toggleExpanded(factor.id)}
              className={`text-left card-hover stagger-${(idx % 6) + 1} animate-fade-up transition-all duration-300 p-5 md:p-6 rounded-2xl border border-border bg-white ${
                expanded ? 'ring-2 ring-foreground/20 shadow-md' : 'hover:border-foreground/20'
              }`}
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-bold uppercase tracking-tight leading-tight">
                    {factor.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${i < factor.stars ? 'text-[var(--red)]' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm md:text-base font-bold text-[var(--red)]">
                    +{factor.impact}%
                  </span>
                </div>
              </div>

              {/* Short Explanation */}
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-3 transition-all duration-300">
                {factor.shortExplanation}
              </p>

              {/* Expandable Details */}
              {expanded && (
                <div className="mt-4 pt-4 border-t border-border/30 animate-fade-up">
                  <p className="text-xs md:text-sm uppercase tracking-wider font-medium text-muted-foreground mb-3">
                    Data Used:
                  </p>
                  <ul className="space-y-2">
                    {factor.dataUsed.map((item) => (
                      <li key={item} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-[var(--red)] font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 p-3 md:p-4 bg-blue-50 border border-blue-200/50 rounded-lg">
                    <p className="text-xs md:text-sm text-blue-900 leading-relaxed">
                      This factor positively influences your score. Maintaining these patterns will help improve your Trust Score over time.
                    </p>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
