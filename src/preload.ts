import { contextBridge, ipcRenderer } from "electron";

console.log("✅ preload loaded");

contextBridge.exposeInMainWorld("api", {
  ping: () => "pong",
  getStore: (key: string) => ipcRenderer.invoke("store:get", key),
  setStore: (key: string, value: any) =>
    ipcRenderer.invoke("store:set", key, value),
  showNotification: (data: { title: string; body: string }) =>
    ipcRenderer.invoke("notification:show", data),
});
