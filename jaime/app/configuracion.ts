// direccion del backend (Express). En Vercel se define NEXT_PUBLIC_API_URL con la url de Render;
// en local, si no existe, se usa el backend en el puerto 3001
export const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
