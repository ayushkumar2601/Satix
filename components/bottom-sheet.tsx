'use client'

import { ReactNode, useState } from 'react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  actionButton?: {
    label: string
    onClick: () => void
    disabled?: boolean
  }
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  actionButton,
}: BottomSheetProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          animation: isOpen ? 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Handle indicator */}
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-4 md:px-6 pb-8">
          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-balance mb-6">
            {title}
          </h2>

          {/* Body */}
          <div className="mb-8">{children}</div>

          {/* Action Button */}
          {actionButton && (
            <button
              onClick={actionButton.onClick}
              disabled={actionButton.disabled}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold py-4 px-6 rounded-lg btn-hover transition-colors duration-200 text-lg"
            >
              {actionButton.label}
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-4 px-6 rounded-lg btn-hover transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}
