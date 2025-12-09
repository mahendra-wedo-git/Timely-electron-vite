import { contextBridge } from 'electron';

// Define the API interface
interface ElectronAPI {
  ping: () => string;
}

// Expose API to renderer process
contextBridge.exposeInMainWorld('api', {
  ping: (): string => 'pong'
} as ElectronAPI);

// Type declaration for window object (create a separate file window.d.ts for better organization)
declare global {
  interface Window {
    api: ElectronAPI;
  }
}

export {};