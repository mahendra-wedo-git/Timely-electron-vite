// Type declarations for Electron API exposed to renderer

export interface ElectronAPI {
  ping: () => string;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}

export {};