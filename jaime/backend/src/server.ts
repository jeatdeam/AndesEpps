// carga backend/.env (base de datos, cloudinary, correo, WhatsApp y sesion del dashboard)
import "dotenv/config";
import express, {type Request, type Response, type NextFunction} from "express";
import cors from "cors";
import controladores from "./controllers/controladores";
import banners from "./controllers/banners";
import cotizaciones from "./controllers/cotizaciones";
import webhookWhatsapp from "./controllers/webhookWhatsapp";
import autenticacion, {soloAdministrador} from "./autenticacion";
import {CARPETA_UPLOADS} from "./almacen";
import {subirImagenes, subirImagenBanner} from "./subidas";

const app = express();

// la cookie de sesion solo viaja si el origen esta permitido (URL_TIENDA, separadas por coma si son varias)
const origenes = (process.env.URL_TIENDA || 'http://localhost:3000').split(',').map(o => o.trim().replace(/\/+$/, ''));
app.use(cors({origin: origenes, credentials: true}));
// el webhook de WhatsApp necesita el cuerpo sin procesar para comprobar la firma de meta, por eso va antes de express.json
app.get('/webhook/whatsapp', webhookWhatsapp.verificar);
app.post('/webhook/whatsapp', express.raw({type: 'application/json'}), webhookWhatsapp.recibir);
app.use(express.json());
app.use("/uploads", express.static(CARPETA_UPLOADS));

app.get("/", (req, res) => {
    res.json({
        message: "Servidor funcionando"
    });
});

app.post('/auth/login', autenticacion.iniciarSesion);
app.post('/auth/logout', autenticacion.cerrarSesion);
app.get('/auth/sesion', autenticacion.verSesion);

app.get("/productos", controladores.categorias)
app.get("/getProductosCategoria", controladores.getProductosCategoria);
app.get('/productos/:id', controladores.getProductElegido);
// la sesion se revisa antes de recibir las imagenes, asi nadie sin cuenta sube archivos
app.post('/productos', soloAdministrador, subirImagenes, controladores.crearProducto);
app.put('/productos/:id', soloAdministrador, subirImagenes, controladores.actualizarProducto);
app.delete('/productos/:id', soloAdministrador, controladores.eliminarProducto);

app.get('/banners', banners.getBanners);
app.put('/banners/:posicion', soloAdministrador, subirImagenBanner, banners.guardarBanner);
app.delete('/banners/:posicion', soloAdministrador, banners.quitarBanner);

app.get('/cotizaciones/canales', cotizaciones.canalesDisponibles);
app.post('/cotizaciones', cotizaciones.crearCotizacion);
app.post('/cotizaciones/enviar', cotizaciones.enviarCotizacion);
app.get('/cotizaciones-pdf/:archivo', cotizaciones.descargarPdf);

// errores no previstos (ej. la base de datos no responde): se registran y se responde en JSON
app.use((error : unknown, _req : Request, res : Response, _next : NextFunction) => {
    console.error(error);
    res.status(500).json({error: 'Ocurrió un error en el servidor. Inténtalo de nuevo.'});
});

// en Render el puerto lo asigna la plataforma; en local se usa el 3001
const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
    console.log(`Servidor en el puerto ${PORT}`);
});
