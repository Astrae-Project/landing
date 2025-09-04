import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE;

// Crear instancia de axios
const customAxios = axios.create({
  baseURL,
  withCredentials: true,
});

// Interceptor para manejar refresh token
customAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await generateRefreshToken(); // Refrescar el token
        return customAxios(originalRequest); // Reintentar la solicitud original
      } catch (refreshError) {
        console.error("Error al refrescar el token:", refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Función para refrescar token
export const generateRefreshToken = async () => {
  try {
    const response = await customAxios.post("/auth/refrescar-token");

    if (response.data.accessToken) {
      // Guardar el nuevo token donde lo necesites
    } else {
      console.error("No se recibió un nuevo access token");
    }
  } catch (error) {
    console.error("Error al refrescar el token:", error);
    throw new Error("Error al refrescar el token");
  }
};

export default customAxios;
