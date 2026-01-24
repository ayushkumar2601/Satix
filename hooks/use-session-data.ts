'use client'

import { useState, useCallback } from 'react'

interface SessionData {
  selectedPermissions: string[]
  uploadedFiles: File[]
  trustScore?: number
  scoreBreakdown?: Record<string, number>
  selectedLoan?: {
    amount: number
    tenure: number
    emi: number
  }
}

const STORAGE_KEY = 'trustscore_session'

export function useSessionData() {
  const [data, setData] = useState<SessionData>(() => {
    if (typeof window === 'undefined') {
      return {
        selectedPermissions: [],
        uploadedFiles: [],
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored
        ? JSON.parse(stored)
        : {
            selectedPermissions: [],
            uploadedFiles: [],
          }
    } catch (error) {
      console.error('[v0] Failed to parse session data:', error)
      return {
        selectedPermissions: [],
        uploadedFiles: [],
      }
    }
  })

  const updateData = useCallback((updates: Partial<SessionData>) => {
    setData((prev) => {
      const newData = { ...prev, ...updates }
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
        } catch (error) {
          console.error('[v0] Failed to save session data:', error)
        }
      }
      return newData
    })
  }, [])

  const clearData = useCallback(() => {
    setData({
      selectedPermissions: [],
      uploadedFiles: [],
    })
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  return {
    data,
    updateData,
    clearData,
  }
}
