import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

let authTokenGetter = null;

export const setAuthTokenGetter = (getter) => {
  authTokenGetter = getter;
};

axiosInstance.interceptors.request.use(async (config) => {
  if (authTokenGetter) {
    const token = await authTokenGetter();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default axiosInstance;
