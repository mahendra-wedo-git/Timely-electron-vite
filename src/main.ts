import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "url";
import path from "path";
import Store from "electron-store";
import started from "electron-squirrel-startup";

const store = new Store();
if (started) {
  app.quit();
}

// IPC handlers for store
ipcMain.handle("store:get", (_, key) => store.get(key));
ipcMain.handle("store:set", (_, key, value) => {
  store.set(key, value);
  return true;
});
ipcMain.handle("store:delete", (_, key) => {
  store.delete(key);
  return true;
});
ipcMain.handle("store:clear", () => {
  store.clear();
  return true;
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Declare Vite environment variables
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string | undefined;

const createWindow = (): void => {
    const isDev = !app.isPackaged;
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
       preload: path.join(__dirname, '.vite/build/preload.js'),
      //  preload: path.join(__dirname, '.vite/build/preload.js'),
        // preload: isDev
        // ? path.join(__dirname, "./preload.ts")   // DEV
        // : path.join(__dirname, ".vite/build/preload.js"), // PROD
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });


  const devServer = MAIN_WINDOW_VITE_DEV_SERVER_URL;
  const viteName = MAIN_WINDOW_VITE_NAME ?? 'main_window';

  if (isDev && devServer) {
    mainWindow.loadURL(devServer);
    // Open DevTools in development
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${viteName}/index.html`));
  }
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
