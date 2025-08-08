import Link from 'next/link'

interface DatabaseSetupMessageProps {
  message: string
  showSetupInstructions?: boolean
}

export default function DatabaseSetupMessage({ 
  message, 
  showSetupInstructions = true 
}: DatabaseSetupMessageProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto border border-gray-200">
      <div className="text-center">
        <div className="text-6xl mb-4">🔧</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Database Setup Required</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        
        {showSetupInstructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
            <h4 className="text-lg font-semibold text-blue-900 mb-3">Setup Instructions:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Open your Supabase project dashboard</li>
              <li>Go to the SQL Editor</li>
              <li>Copy the contents of <code className="bg-blue-100 px-2 py-1 rounded">docs/PRODUCT_REVIEW_SYSTEM_SETUP.sql</code></li>
              <li>Paste and run the SQL script</li>
              <li>Refresh this page</li>
            </ol>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> The SQL file contains all the necessary tables, functions, and security policies for the product review system.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Refresh Page After Setup
          </button>
          
          <Link
            href="/"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-center"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
