# Prompt: tienda de EPP "Los Andes J & C"

> Copia todo este archivo como primer mensaje. Reemplaza lo que está entre `<...>` con tus datos.

---

## 0. Cómo quiero que trabajes

- Construye el proyecto **por fases** (sección 9). Al terminar cada fase: compila, prueba lo que hiciste (con capturas del navegador o peticiones al backend) y dime qué verificaste antes de pasar a la siguiente.
- Si algo de esta especificación es ambiguo, **pregúntame antes** de decidir por tu cuenta. Si una decisión es técnica y tiene una opción estándar, elígela y dime cuál tomaste.
- Todo el código, los comentarios, los nombres de variables y los textos de la interfaz van **en español** (sin tildes en nombres de código).
- No subas secretos a Git. Todas las credenciales van en `.env` (excluido de Git) y documentadas en `.env.example` sin valores reales.
- Antes de usar una API de Next.js, revisa la documentación que viene en `node_modules/next/dist/docs/` (la versión puede ser más nueva que lo que conoces).

---

## 1. El negocio

Tienda en línea de **equipos de protección personal (EPP)** para minería y construcción en Perú. **No vende en línea**: el cliente arma un carrito y **pide una cotización**, que recibe en PDF por correo y/o WhatsApp. La venta se cierra por fuera (WhatsApp/correo). Moneda: soles (`S/`), precios incluyen IGV (18%).

---

## 2. Tecnologías

| Parte | Tecnología |
|---|---|
| Frontend | **Next.js 16** (App Router) + React + TypeScript + **Tailwind CSS 4** |
| Estado del cliente | **zustand** (carrito con `persist` en localStorage, búsqueda, modal de cotización) |
| Peticiones | axios |
| Animaciones | **lottie-web** (archivos JSON propios en `app/animaciones/`) |
| Fuente | Poppins (next/font) |
| Backend | **Express 5** + TypeScript (carpeta `backend/`), ejecutado con nodemon + ts-node |
| Base de datos | **Supabase (PostgreSQL)** con **Prisma** |
| Imágenes | **Cloudinary** (si no está configurado, guardar en `backend/uploads/`) |
| PDF | pdfkit + sharp (miniaturas JPG de las fotos) |
| Correo | nodemailer (Gmail con contraseña de aplicación) |
| WhatsApp | WhatsApp Business Cloud API de Meta (plantilla con encabezado de documento) |
| Autenticación | bcryptjs + jsonwebtoken en cookie httpOnly |

Estructura:
```
jaime/                 → frontend Next.js
jaime/backend/         → API Express
jaime/backend/prisma/  → esquema y migraciones
```

---

## 3. Base de datos (Prisma + Supabase)

- `DATABASE_URL` = pooler de Supabase (puerto **6543**, `?pgbouncer=true`) → lo usa el backend.
- `DIRECT_URL` = conexión de sesión (puerto **5432**) → la usa `prisma migrate`. En `prisma.config.ts`, `datasource.url = env("DIRECT_URL")`.
- Un solo `PrismaClient` compartido (`src/db.ts`).

Modelos:
- **Producto**: `id`, `name` (único, minúsculas), `precio` Decimal(10,2), `stock`, `img` String[], `descripcionPrimaria`, `descripcionSecundaria[]`, `caracteristicas[]`, `informacionAdicional[]`, `categoria` (índice), `marca?`, `normas[]`, `tallas[]`, `colores[]`, `material?`, `descuento` Int (0 = sin oferta), `creadoEn?` (define "nuevos ingresos"), `calificacion?`, `resenas?`.
- **Banner**: `posicion` (id: `principal`, `secundario-1..3`, `nuevos-1..5`), `imagen`, `titulo`, `categoria?`, `productoId?` (relación con `onDelete: SetNull`).
- **Cotizacion**: `id` autoincremental (el número `COT-000001` sale del id para que no se repita), `numero` único, `archivo` único (nombre del PDF con 16 caracteres hex aleatorios), `fecha`, `cliente` Json, `items` Json, `total` Decimal, `enviosCorreo`, `enviosWhatsapp`.
- **Administrador**: `correo` único, `contrasena` (hash bcrypt), `nombre`.

**Seguridad obligatoria (migración aparte):** activar **RLS** en todas las tablas sin políticas y `REVOKE ALL` a los roles `anon` y `authenticated` (incluidas tablas futuras con `ALTER DEFAULT PRIVILEGES`). La API REST pública de Supabase debe quedar cerrada; solo el backend entra con Prisma. Ojo: los nombres de las carpetas de migraciones deben quedar en orden cronológico.

Scripts: `src/scripts/crearAdministrador.ts correo "contraseña" "Nombre"` (crea o cambia la contraseña) e `importarJson.ts` (carga datos iniciales).

---

## 4. Backend (Express)

Rutas:
| Método | Ruta | Protegida |
|---|---|---|
| GET | `/productos` (lista de categorías), `/getProductosCategoria`, `/productos/:id`, `/banners` | No |
| POST/PUT/DELETE | `/productos`, `/productos/:id`, `/banners/:posicion` | **Sí** (la sesión se revisa **antes** de recibir archivos) |
| POST | `/auth/login`, `/auth/logout` · GET `/auth/sesion` | — |
| GET | `/cotizaciones/canales` · POST `/cotizaciones`, `/cotizaciones/enviar` · GET `/cotizaciones-pdf/:archivo` | No |

Reglas:
- **Validación en el servidor**: nombre y categoría en minúsculas, sin `- / ? # %` (forman la URL); precio ≥ 0; stock entero; descuento entero 0–90; 1 a 8 imágenes de máx. 5 MB (JPG, PNG, WEBP, GIF, AVIF).
- **Imágenes**: multer en memoria → Cloudinary en `<CLOUDINARY_CARPETA>/productos` y `/banners`. Al reemplazar o borrar, eliminar de Cloudinary **solo** las imágenes de esa carpeta y de esa cuenta.
- **Cotización**: los nombres, fotos y precios salen de la base de datos, nunca del navegador. Máx. 50 productos y 9999 unidades. WhatsApp peruano de 9 dígitos → anteponer `51`. Máx. 3 reenvíos por canal. Si un canal falla, el otro igual se envía y el PDF siempre se puede descargar. El PDF se regenera desde la base de datos si no está en disco.
- **Correo**: HTML con tabla de productos, fotos incrustadas (cid), total, validez de 7 días y PDF adjunto; copia oculta a `CORREO_VENTAS`. Cada canal se activa solo si sus variables existen.
- **Login**: bcrypt (costo 12), JWT en cookie `httpOnly` de 7 días, bloqueo de 15 min tras 5 intentos fallidos por IP, mismo tiempo de respuesta si el correo no existe. CORS con `credentials: true` y origen `URL_TIENDA`. `COOKIE_SAMESITE=none` si frontend y backend quedan en dominios distintos.
- Manejador de errores final que responde JSON. Puerto desde `PORT`.

---

## 5. Frontend: páginas y funciones

- **Header flotante** (`fixed`, redondeado, fondo azul translúcido, se desenfoca al hacer scroll): logo, Productos, Ofertas, menú de Categorías, buscador, bolsa de compras, menú hamburguesa. **No** mostrar enlace al dashboard.
- **Buscador del header**: sin distinguir mayúsculas; si no hay resultados, mostrar animación Lottie de "sin resultados" (lupa recorriendo una caja vacía con un "?") y el texto *No encontramos productos para "…"*.
- **Bolsa de compras** (desplegable al pasar el cursor): lista, total, botón de **solo ícono** para cotizar (al pasar el cursor aparece la etiqueta "Cotizar" a su derecha, usando un `group` con nombre propio para no chocar con el `group` de la bolsa) y botón de vaciar con animación Lottie. Ambos íconos del mismo tamaño visual.
- **Inicio**: slider de imágenes, carrusel "Nuestras marcas", sección **Ofertas** (banner principal + 3 secundarios, automáticos según descuentos o configurados desde el dashboard), mosaico de **categorías**, carrusel **más buscados**, sección **Nuevos ingresos** (2 grandes + 3 pequeños) y botón flotante de WhatsApp con pulso.
- **Catálogo `/productos`** (también para categorías y ofertas mediante parámetros en la URL): facetas Tipo/Marca/Norma/Talla/Color/Material con conteos calculados excluyendo su propia faceta, rango de precio, solo en stock, oferta, calificación, búsqueda sin tildes, 7 órdenes, filtros activos como etiquetas, "Limpiar filtros". En celular los filtros son un cajón deslizable. `/productos/[categoria]` redirige al catálogo con el filtro marcado.
- **Detalle `/productos/[categoria]/[producto]`**: galería (imagen principal **siempre cuadrada**, barra de progreso que cambia de imagen cada 5 s y se pausa con el cursor, miniaturas, flechas) y descripción (categoría, nombre, calificación, SKU, precio con descuento, stock, características, botones Agregar al carrito y Cotizar, medios de pago). Debajo, pestañas Especificaciones / Descripción / Comentarios y productos recomendados.
- **Modal de cotización**: productos editables, elegir correo y/o WhatsApp (solo los canales configurados), datos del cliente (recordados en localStorage salvo el mensaje), pantalla final con estado por canal, reenvío a otro destino, descargar PDF y **flecha ← para volver** al formulario.
- **Dashboard `/dashboard`** con login `/dashboard/login`: gestión de productos (crear, editar, borrar, varias imágenes, estadísticas, alertas de stock bajo) y de banners por posición. Botón cerrar sesión.
- Páginas de error 404/500 y estado de carga con Lottie.

---

## 6. Diseño (respetar exactamente)

- **Fondo de toda la página**: degradado azul hielo fijo: `linear-gradient(160deg, #d6ecf8 0%, #e6f4fb 35%, #f3f9fd 70%, #ffffff 100%)` con `background-attachment: fixed`.
- **Tarjetas y recuadros**: fondo blanco, borde de 1 px `shadow-[0_0_0_1px_rgba(0,0,0,.12)]`, `rounded-[12.5px]`, relleno 25 px. Lo usan: galería y descripción del producto (mismo ancho y alto, lado a lado desde `lg`), pestañas, tarjeta del catálogo y, dentro de ella, un recuadro para **filtros** y otro para **productos**.
- **Tarjetas de Ofertas y Nuevos ingresos**: tres tonos de hielo en degradado diagonal (`#eef8fd→#d3ebf8`, `#e1f2fb→#bfe2f5`, `#d3ebf8→#a8d5ef`) con `ring-1 ring-white/80`; textos azul marino (`slate-900`); botones `slate-900` o `sky-700`; etiquetas de descuento en rojo. El espacio sobre el botón va en un contenedor, **no** en el botón (si no, el texto queda descentrado).
- **Footer**: degradado azul hielo `#d6ecf8→#b9dff3`, textos `slate-600/900`, acentos `sky-700`, recuadro "Ventas corporativas" en blanco translúcido.
- **Anchos**: el menú flotante y el slider del inicio miden igual: `w-[calc(100%-16px)] sm:w-[94%] 2xl:w-[max(74%,1240px)]`. El contenido de las páginas va un poco más angosto (`w-[90%]`, `2xl:w-[70%]`). En el detalle de producto, entre 768 px y 1023 px el ancho queda fijo en el que tiene a 768 px.
- **Slider**: imágenes con `object-cover`, desplazamiento en unidades `cqw` del contenedor (no `vw`), **difuminado solo a izquierda y derecha** con `mask-image` (10% por lado) para que se vea el fondo hielo real.
- **Sin scroll horizontal** en ningún ancho (`overflow-x: clip` en `html, body`) ni scroll interno en la descripción del producto (usar alto mínimo, no fijo).
- Paleta de animaciones Lottie: trazo azul marino `#0F172A`, rellenos amarillos/naranja.
- Debe verse bien en 360, 768, 1024, 1280 y 1920 px.

---

## 7. Variables de entorno

Frontend: `NEXT_PUBLIC_API_URL` (no escribir `localhost:3001` fijo en el código).

Backend (`backend/.env`, documentar en `.env.example`):
```
URL_TIENDA, PORT
DATABASE_URL, DIRECT_URL
JWT_SECRETO (≥ 32 caracteres aleatorios), COOKIE_SAMESITE
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CARPETA
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CORREO_REMITENTE, CORREO_VENTAS
WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_API_VERSION, WHATSAPP_PLANTILLA, WHATSAPP_IDIOMA
```

Datos del negocio: nombre `<Los Andes J & C>`, WhatsApp `<número>`, correos `<correos de contacto>`, horario `<horario>`, categorías:
`<sistemas de bloqueo, proteccion de cabeza, proteccion visual, proteccion auditiva, proteccion corporal, proteccion de manos, calzados de seguridad, proteccion facial, proteccion para soldador, proteccion respiratoria, proteccion de alturas, reflectivos señalizacion>`.

---

## 8. Despliegue (preparar, no ejecutar sin preguntarme)

- Frontend en Vercel o Railway; backend en Railway o Render (servidor siempre encendido); base de datos en Supabase; imágenes en Cloudinary.
- Backend: `build` = `prisma generate && tsc`, `start` = `node dist/server.js`, migraciones con `prisma migrate deploy`.
- Verificar que `next build` compile sin errores.

---

## 9. Fases y criterios de aceptación

1. **Base**: proyecto Next + Express, Tailwind, fuentes, layout, header, footer, fondo hielo. ✔ Compila y se ve en los 5 anchos sin scroll horizontal.
2. **Datos**: Prisma + Supabase, modelos, migraciones (incluida la de RLS), script de importación con 10 productos de ejemplo. ✔ El rol `anon` no puede leer ninguna tabla.
3. **Catálogo y detalle**: catálogo con filtros, detalle de producto, buscador del header. ✔ Filtros en la URL, conteos correctos, imagen siempre cuadrada.
4. **Carrito y cotización**: carrito persistente, modal, PDF, correo, WhatsApp. ✔ Se genera el PDF y llega el correo con adjunto.
5. **Dashboard**: login, CRUD de productos y banners con Cloudinary. ✔ Sin sesión, las rutas protegidas responden 401 y no se sube ningún archivo.
6. **Inicio completo**: slider, ofertas, categorías, más buscados, nuevos ingresos. ✔ Botones alineados y colores hielo.
7. **Pulido**: animaciones Lottie, estados vacíos y de error, revisión responsive, `npm run build` sin errores.

---

## 10. Problemas conocidos de mi PC (Windows)

- Mi antivirus **AVG** intercepta conexiones TLS (SMTP 465/587, Cloudinary) y el puerto **5432** de Postgres; mi VPN también puede bloquearlo. Si una conexión falla con `self-signed certificate` o se queda colgada, avísame antes de cambiar el código.
- La terminal es Windows con PowerShell y Git Bash.
