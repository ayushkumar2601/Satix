'use client'

import { useState } from 'react'
import { Shield, Check, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PhantomWalletProps {
  onConnect?: (walletAddress: string) => void
  isLoading?: boolean
}

export function PhantomWallet({ onConnect, isLoading = false }: PhantomWalletProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      // Simulate wallet connection
      // In production, this would use the actual Phantom wallet SDK
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock wallet address
      const mockAddress = '8vB7mGcH5v2Hj7kL9nP2qR4sT6uV8wX1yZ3aB5cD7e'
      setWalletAddress(mockAddress)
      setIsConnected(true)
      onConnect?.(mockAddress)
    } catch (error) {
      console.error('Wallet connection failed:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setWalletAddress('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 mb-4">
        <Shield className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            <span className="font-medium">Add extra security (optional)</span>
            <br />
            Connect your Phantom wallet for identity assurance and fraud prevention. Your funds are safe—we only verify your wallet, we don't access your assets.
          </p>
        </div>
      </div>

      {!isConnected ? (
        <Button
          type="button"
          onClick={handleConnect}
          disabled={isConnecting || isLoading}
          className="w-full bg-background text-foreground border-2 border-foreground hover:bg-muted py-3 md:py-4 rounded-xl md:rounded-lg uppercase tracking-wider font-semibold text-sm md:text-base btn-hover transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Wallet className="w-5 h-5" />
          {isConnecting ? 'Connecting...' : 'Connect Phantom Wallet'}
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-base font-semibold text-green-900 mb-1">
                Wallet Connected ✓
              </p>
              <p className="text-xs md:text-sm text-green-700 font-mono truncate">
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
              </p>
              <p className="text-xs text-green-600 mt-2">
                Your identity is verified and secured
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDisconnect}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 py-2 underline"
          >
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  )
}
