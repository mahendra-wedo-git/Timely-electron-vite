/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WORKSPACE?: string;
  readonly VITE_APP_API_URL?: string;

  // add other env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
