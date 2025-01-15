// src/services/api/customAxios.js
import axios from "axios";

// Crear instancia de Axios con configuración personalizada
const customAxios = axios.create({
  withCredentials: true, // Para enviar cookies en solicitudes CORS
});

// Interceptor de respuestas
customAxios.interceptors.response.use(
  (response) => response, // Manejar respuestas exitosas
  async function (error) {
    const originalRequest = error.config;

    // Si el error es 403 (token inválido) y no se ha reintentado aún
    if (error.response && error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Solicitar nuevo token al servidor
        await customAxios.get(`http://localhost:5000/api/auth/refrescar-token`, {
          withCredentials: true, // Importante para enviar y recibir cookies
        });

        // Reenviar la solicitud original
        return customAxios(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // Opcional: Redirigir al usuario al inicio de sesión o manejar el error
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default customAxios;
