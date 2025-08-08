import { NextResponse } from 'next/server'
import { getMarketplaceStats } from '@/lib/supabase'

export async function GET() {
  console.log('🔍 API Route: Testing marketplace stats')
  
  try {
    const result = await getMarketplaceStats()
    console.log('🔍 API Route: Function result:', result)
    
    return NextResponse.json({
      success: true,
      result: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('🔍 API Route: Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
