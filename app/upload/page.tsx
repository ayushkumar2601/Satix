"use client"

import React from "react"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Upload, Check, X, FileText, Link2 } from "lucide-react"

interface UploadedFile {
  name: string
  type: string
  size: number
}

export default function UploadPage() {
  const router = useRouter()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [upiConnected, setUpiConnected] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const newFiles = files.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size
    }))
    setUploadedFiles(prev => [...prev, ...newFiles])
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files).map(f => ({
        name: f.name,
        type: f.type,
        size: f.size
      }))
      setUploadedFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleContinue = () => {
    if (uploadedFiles.length > 0 || upiConnected) {
      setIsLoading(true)
      setTimeout(() => {
        router.push("/analyzing")
      }, 800)
    }
  }

  const progress = uploadedFiles.length > 0 && upiConnected ? 100 : 
                   uploadedFiles.length > 0 || upiConnected ? 50 : 0

  return (
    <main className="min-h-screen flex flex-col bg-[var(--cream)]">
      {/* Header - Mobile Sticky */}
      <header className="sticky top-0 z-40 bg-[var(--cream)]/95 backdrop-blur-sm px-4 md:px-6 py-4 flex items-center justify-between border-b border-border/40">
        <Link href="/" className="text-lg md:text-xl font-bold uppercase tracking-tight">
          Satix
        </Link>
        <Link href="/consent" className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </header>

      {/* Progress bar */}
      <div className="px-4 md:px-6 py-3 md:py-4">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-foreground transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-right">
          {progress}% Complete
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 md:px-6 py-8">
        {/* Heading */}
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-balance mb-3 md:mb-4 leading-tight">
            Upload Your Data
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Share your utility bills and connect UPI for the most accurate Trust Score
          </p>
        </div>

        <div className="space-y-6 md:space-y-8 flex-1">
          {/* File Upload Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-6 md:p-8 text-center card-hover transition-all duration-200 stagger-1 animate-fade-up ${
              isDragging 
                ? "border-foreground bg-gray-50 shadow-sm" 
                : "border-border hover:border-foreground/30 hover:shadow-sm"
            }`}
          >
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center transition-transform duration-200">
              <Upload className="w-7 h-7" />
            </div>
            <h3 className="text-lg md:text-xl font-bold uppercase tracking-tight mb-2">
              Upload Bill Screenshots
            </h3>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              Drag and drop or click to upload electricity, water, or gas bills
            </p>
            <p className="text-xs md:text-sm text-muted-foreground mt-3">
              Supports: JPG, PNG, PDF (Max 10MB each)
            </p>
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2 animate-fade-up stagger-2">
              <p className="text-xs md:text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Uploaded Files ({uploadedFiles.length})
              </p>
              {uploadedFiles.map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 md:p-4 bg-white rounded-lg border border-border card-hover transition-all duration-200"
                >
                  <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 text-sm truncate font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {(file.size / 1024).toFixed(0)}KB
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* UPI Connection */}
          <div className="border-t border-border pt-6 md:pt-8">
            <button
              type="button"
              onClick={() => setUpiConnected(!upiConnected)}
              className={`w-full p-4 md:p-6 rounded-2xl border-2 text-left card-hover stagger-3 animate-fade-up transition-all duration-200 ${
                upiConnected 
                  ? "border-foreground bg-white shadow-sm" 
                  : "border-border bg-white hover:border-foreground/30 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3 md:gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  upiConnected ? "bg-foreground text-white scale-110" : "bg-muted text-foreground"
                }`}>
                  {upiConnected ? <Check className="w-6 h-6" /> : <Link2 className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-bold uppercase tracking-tight mb-1">
                    {upiConnected ? "✓ UPI Connected" : "Connect UPI (Read-Only)"}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {upiConnected 
                      ? "Your transaction data will be analyzed securely"
                      : "Securely link your UPI account for transaction analysis"
                    }
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Continue Button */}
          <div className="space-y-3 md:space-y-4 pt-6 md:pt-8">
            <Button
              onClick={handleContinue}
              disabled={(uploadedFiles.length === 0 && !upiConnected) || isLoading}
              className="w-full bg-foreground text-white hover:bg-foreground/90 disabled:bg-gray-300 py-4 md:py-6 rounded-xl md:rounded-full uppercase tracking-wider font-semibold text-base md:text-lg btn-hover group transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⟳</span>
                  Processing...
                </>
              ) : (
                <>
                  Analyze My Data
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>

            <p className="text-center text-xs md:text-sm text-muted-foreground leading-relaxed">
              All data is encrypted with bank-level security
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
