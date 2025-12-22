/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly __APP_VERSION__: string
  // More env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}