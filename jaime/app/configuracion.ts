// direccion del backend (Express). En Vercel se define NEXT_PUBLIC_API_URL con la url de Render;
// en local, si no existe, se usa el backend en el puerto 3001
export const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

// whatsapp de la tienda (codigo de pais + numero, solo digitos). Las cotizaciones se mandan con un enlace
// wa.me que abre el whatsapp del cliente con el mensaje listo; se puede cambiar con NEXT_PUBLIC_WHATSAPP_TIENDA
export const WHATSAPP_TIENDA = (process.env.NEXT_PUBLIC_WHATSAPP_TIENDA || '51986680850').replace(/\D/g, '');
