/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { BrowserPersistence, localStorageKeys } from "src/utils";
const storage = new BrowserPersistence();

export abstract class APIService {
  protected baseURL: string;
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.axiosInstance = axios.create({
      baseURL,
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (!config) return config;
        const token = storage.getItem(localStorageKeys.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          storage.removeItem(localStorageKeys.AUTH_TOKEN);
          // Login / user slice use raw localStorage for these keys
          localStorage.removeItem(localStorageKeys.USER_EMAIL);
          localStorage.removeItem("currentUser");

          // Notify React to re-check auth from localStorage immediately.
          // In packaged Electron builds, UI may otherwise update only after manual refresh.
          window.dispatchEvent(new Event("timely:auth-logout"));

          // file:// (packaged Electron): pathname is the real path to index.html, not the SPA route.
          // HashRouter keeps the app path in the hash (e.g. #/wedo/dashboard).
          const spaPath =
            window.location.protocol === "file:"
              ? window.location.hash.replace(/^#/, "") || "/"
              : `${window.location.pathname}${window.location.search}`;

          const qs =
            spaPath && spaPath !== "/"
              ? `?next_path=${encodeURIComponent(spaPath)}`
              : "";

          if (window.location.protocol === "file:") {
            // Only update hash to let HashRouter handle navigation (no full document replace).
            window.location.hash = `/${qs}`;
          } else {
            window.location.replace(`/${qs}`);
          }
        }
        return Promise.reject(error);
      },
    );
  }

  get(url: string, params = {}, config: AxiosRequestConfig = {}) {
    return this.axiosInstance.get(url, {
      ...params,
      ...config,
    });
  }

  post(url: string, data = {}, config: AxiosRequestConfig = {}) {
    return this.axiosInstance.post(url, data, config);
  }

  put(url: string, data = {}, config: AxiosRequestConfig = {}) {
    return this.axiosInstance.put(url, data, config);
  }

  patch(url: string, data = {}, config: AxiosRequestConfig = {}) {
    return this.axiosInstance.patch(url, data, config);
  }

  delete(url: string, data?: any, config: AxiosRequestConfig = {}) {
    return this.axiosInstance.delete(url, { data, ...config });
  }

  request(config = {}) {
    return this.axiosInstance(config);
  }
}
