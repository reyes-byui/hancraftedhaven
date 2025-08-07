'use client'

import { useState } from 'react'
import { useAuthErrorRecovery } from './AuthErrorRecovery'

export default function AuthRecoveryButton() {
  const [isRecovering, setIsRecovering] = useState(false)
  const { clearAuthState, recoverAuth } = useAuthErrorRecovery()

  const handleRecovery = async () => {
    setIsRecovering(true)
    
    try {
      console.log('🔄 User initiated auth recovery...')
      
      // First try to recover
      const recovered = await recoverAuth()
      
      if (recovered) {
        console.log('✅ Auth recovery successful!')
        alert('Session recovered successfully!')
        window.location.reload()
      } else {
        console.log('❌ Auth recovery failed, clearing state...')
        await clearAuthState()
      }
    } catch (error) {
      console.error('❌ Recovery error:', error)
      alert('Unable to recover session. You will be redirected to login.')
      window.location.href = '/login'
    } finally {
      setIsRecovering(false)
    }
  }

  const handleClearAuth = async () => {
    setIsRecovering(true)
    
    try {
      console.log('🧹 User initiated auth clearing...')
      await clearAuthState()
    } catch (error) {
      console.error('❌ Clear auth error:', error)
      window.location.href = '/login'
    } finally {
      setIsRecovering(false)
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-2">
          <p className="text-sm font-medium">Session Error Detected</p>
          <div className="flex space-x-2">
            <button
              onClick={handleRecovery}
              disabled={isRecovering}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isRecovering ? 'Recovering...' : 'Try Recovery'}
            </button>
            <button
              onClick={handleClearAuth}
              disabled={isRecovering}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {isRecovering ? 'Clearing...' : 'Sign Out & Clear'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
