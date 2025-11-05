import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { UserProvider } from './context/UserContext.tsx'
import { DashboardProvider } from './context/DashboardContext.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { initSentry } from './utils/sentry'
import './utils/debug' // Initialize debug utilities
import './index.css'

// Initialize Sentry error tracking (silently fails if not configured)
try {
  initSentry()
} catch (error) {
  // Silently handle initialization errors
  if (import.meta.env.DEV) {
    // Only log in development for debugging
    console.debug('Sentry initialization skipped');
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <UserProvider>
          <DashboardProvider>
            <App />
          </DashboardProvider>
        </UserProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

