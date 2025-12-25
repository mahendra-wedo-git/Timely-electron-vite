export const migrateLocalStorage = async () => {
  if (!window.api) {
    console.warn("Electron API not available");
    return;
  }

  const migrated = await window.api.getStore("__migrated_ls__");
  if (migrated) return;

  for (const key of Object.keys(localStorage)) {
    const value = localStorage.getItem(key);
    if (value !== null) {
      try {
        await window.api.setStore(key, JSON.parse(value));
      } catch {
        await window.api.setStore(key, value);
      }
    }
  }

  localStorage.clear();
  await window.api.setStore("__migrated_ls__", true);
};
