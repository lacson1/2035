/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_SENTRY_DSN?: string
  readonly MODE: 'development' | 'production' | 'test'
  // Add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// For process.env.NODE_ENV (Vite provides this via import.meta.env.MODE)
declare var process: {
  env: {
    NODE_ENV: 'development' | 'production' | 'test'
  }
}

