import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/lib/stores/auth-store";

const coreBaseURL =
  process.env.NEXT_PUBLIC_CORE_API_URL || "http://localhost:3000/api";

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ accessToken: string }>(
        `${coreBaseURL}/auth/refresh`,
        undefined,
        { withCredentials: true, timeout: 30000 }
      )
      .then((res) => res.data.accessToken)
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

export { refreshAccessToken };

export const restoreSession = async (): Promise<boolean> => {
  const store = useAuthStore.getState();
  if (store.accessToken) return true;
  const newToken = await refreshAccessToken();
  if (newToken) {
    store.setAccessToken(newToken);
    return true;
  }
  return false;
};

type RetriableRequest = InternalAxiosRequestConfig & { _retried?: boolean };

const createClient = (baseURL: string, opts?: { withRefresh?: boolean; withCredentials?: boolean }): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 30000,
    withCredentials: opts?.withCredentials ?? true,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  });

  if (opts?.withRefresh) {
    client.interceptors.response.use(
      (res) => res,
      async (err: AxiosError) => {
        const original = err.config as RetriableRequest | undefined;
        if (err.response?.status === 401 && original && !original._retried) {
          original._retried = true;
          const newToken = await refreshAccessToken();
          if (newToken) {
            useAuthStore.getState().setAccessToken(newToken);
            original.headers.set("Authorization", `Bearer ${newToken}`);
            return client(original);
          }
          useAuthStore.getState().logout();
        }
        return Promise.reject(err);
      }
    );
  }

  return client;
};

export const coreClient = createClient(coreBaseURL, { withRefresh: true });

export const geoClient = createClient(
  process.env.NEXT_PUBLIC_GEO_API_URL || "http://localhost:8000/api/v1",
  { withCredentials: false }
);
