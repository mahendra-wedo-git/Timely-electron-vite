export {};

declare global {
  interface Window {
    api?: {
      getStore: (key: string) => Promise<any>;
      setStore: (key: string, value: any) => Promise<boolean>;
      deleteStore: (key: string) => Promise<boolean>;
      clearStore: () => Promise<boolean>;
      showNotification: (data: {
        title: string;
        body: string;
      }) => Promise<void>;
    };
  }
}
