

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_STORAGE_URL: string;
  readonly VITE_DB_ENCRYPTION_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.worker?worker" {
  const workerConstructor: new () => Worker;
  export default workerConstructor;
}

declare module "*.worker.ts" {
  const workerConstructor: new () => Worker;
  export default workerConstructor;
}

