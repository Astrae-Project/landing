// src/services/api/customAxios.js
import axios from "axios";

const customAxios = axios.create({
  withCredentials: true,
});

customAxios.interceptors.response.use(
  (response) => response,
  async function (error) {
    const originalRequest = error.config;

    if (error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await generateRefreshToken();
        return customAxios(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const generateRefreshToken = async () => {
  try {
    await customAxios.get(`http://localhost:5000/api/auth/refrescar-token`, {
      withCredentials: true,
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

export default customAxios;
