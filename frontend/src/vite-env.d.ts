/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Sign-in user name (see frontend/.env). */
  readonly VITE_AUTH_USERNAME?: string;
  /** Sign-in password, compared as plain text (development only). */
  readonly VITE_AUTH_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
