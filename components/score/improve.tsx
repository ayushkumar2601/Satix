'use client'

import { CheckCircle2, AlertCircle } from 'lucide-react'

interface ImproveItem {
  id: string
  action: string
  points: number
  difficulty: 'easy' | 'medium' | 'hard'
  timeframe: string
}

export function ImproveScore() {
  const improvements: ImproveItem[] = [
    {
      id: 'autopay',
      action: 'Enable autopay for utility bills',
      points: 30,
      difficulty: 'easy',
      timeframe: '1-3 months'
    },
    {
      id: 'consistency',
      action: 'Maintain transaction consistency',
      points: 20,
      difficulty: 'medium',
      timeframe: '2-4 months'
    },
    {
      id: 'stability',
      action: 'Keep stable address for 6 months',
      points: 25,
      difficulty: 'medium',
      timeframe: '6 months'
    },
    {
      id: 'ontime',
      action: 'Pay all bills on time (12 months)',
      points: 35,
      difficulty: 'medium',
      timeframe: '1 year'
    }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-50 text-green-700'
      case 'medium':
        return 'bg-yellow-50 text-yellow-700'
      case 'hard':
        return 'bg-orange-50 text-orange-700'
      default:
        return 'bg-gray-50 text-gray-700'
    }
  }

  return (
    <div className="mt-12 md:mt-16 pt-8 md:pt-12 border-t border-border/30">
      {/* Section Title */}
      <div className="mb-8 md:mb-10 animate-fade-up">
        <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-balance mb-3">
          How to Improve Your Trust Score
        </h2>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          Take these simple actions to grow your score. Every step counts.
        </p>
      </div>

      {/* Improvement Items */}
      <div className="space-y-3 md:space-y-4">
        {improvements.map((item, idx) => (
          <div
            key={item.id}
            className={`stagger-${(idx % 6) + 1} animate-fade-up card-hover p-4 md:p-5 rounded-xl border border-border bg-white transition-all duration-200 hover:shadow-sm`}
          >
            <div className="flex items-start gap-3 md:gap-4">
              {/* Checkmark Icon */}
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-base md:text-lg font-semibold text-foreground leading-tight">
                    {item.action}
                  </h3>
                  <span className="text-lg md:text-xl font-bold text-[var(--red)] flex-shrink-0">
                    +{item.points}
                  </span>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs md:text-sm px-2.5 py-1 rounded-full font-medium capitalize ${getDifficultyColor(item.difficulty)}`}>
                    {item.difficulty}
                  </span>
                  <span className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {item.timeframe}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Encouraging Footer */}
      <div className="mt-8 md:mt-10 p-4 md:p-6 bg-blue-50 border border-blue-200/50 rounded-xl animate-fade-up stagger-5">
        <p className="text-sm md:text-base text-blue-900 leading-relaxed text-center">
          <span className="font-semibold">Every action matters.</span> Your Trust Score updates monthly as you build better financial habits.
        </p>
      </div>
    </div>
  )
}
