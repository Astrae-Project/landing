import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || 
                (process.env.NODE_ENV === "production"
                  ? "https://api.astraesystem.com/api"
                  : "http://localhost:5000/api");

// Crear una instancia personalizada de axios
const customAxios = axios.create({
  baseURL,
  withCredentials: true, // Asegúrate de que las cookies se envíen
});

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

    return Promise.reject(error); // Rechazar el error si no se puede refrescar el token
  }
);

export const generateRefreshToken = async () => {
  try {
    // usamos la baseURL configurada, no hardcodeada
    const response = await customAxios.post("/auth/refrescar-token");

    if (response.data.accessToken) {
      // aquí deberías guardar el nuevo accessToken en donde lo uses
    } else {
      console.error("No se recibió un nuevo access token");
    }
  } catch (error) {
    console.error("Error al refrescar el token:", error);
    throw new Error("Error al refrescar el token");
  }
};

export default customAxios;
