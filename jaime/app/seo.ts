// textos para buscadores (Google) y para la vista previa al compartir un enlace (WhatsApp, Facebook).
// el cliente principal es la mineria; construccion e industria van al lado
export const SITIO = 'https://www.jm-andes-security.com.pe';
export const MARCA = 'Los Andes EPPS';
export const RAZON_SOCIAL = 'J & M Andes Security E.I.R.L.';
export const TITULO_SITIO = `${MARCA} – EPP para Minería y Construcción | Lima, Perú`;
export const DESCRIPCION_SITIO = 'Equipos de protección personal para minería, construcción e industria: cascos, botas de seguridad, arneses, respiradores y ropa reflectiva. Venta por mayor y menor en Lima. Cotiza por WhatsApp.';

export const aSlug = (texto : string) => texto.replace(/\s+/g, '-').toLowerCase();

const primeraMayuscula = (texto : string) => texto.charAt(0).toUpperCase() + texto.slice(1);

// las categorias vienen sin tildes desde la base de datos; aqui cada una apunta al rubro que mas la usa
const TITULOS_CATEGORIA : Record<string, string> = {
    'proteccion de cabeza' : 'Cascos de seguridad para minería y construcción',
    'calzado de seguridad' : 'Botas y calzado de seguridad para minería y obra',
    'proteccion de alturas' : 'Arneses y líneas de vida para trabajos en altura',
    'proteccion de manos' : 'Guantes de seguridad para minería e industria',
    'proteccion visual' : 'Lentes de seguridad para minería y construcción',
    'proteccion auditiva' : 'Protección auditiva para minería e industria',
    'proteccion facial' : 'Protección facial y respiratoria para minería',
    'proteccion corporal' : 'Ropa de seguridad reflectiva para minería y obra',
    'proteccion para soldador' : 'Equipos de protección para soldador',
    'sistema de bloqueo' : 'Sistemas de bloqueo y etiquetado (LOTO)',
};

export const tituloCategoria = (categoria : string) =>
    TITULOS_CATEGORIA[categoria] ?? `${primeraMayuscula(categoria)} – EPP para minería y construcción`;

export const descripcionCategoria = (categoria : string) =>
    `${tituloCategoria(categoria)}. Venta de EPP por mayor y menor en Lima para empresas mineras, contratistas y obras. Cotiza por WhatsApp con ${MARCA}.`;

// Google muestra unos 155 caracteres de descripcion
export const recortar = (texto : string, maximo = 155) =>
    texto.length <= maximo ? texto : `${texto.slice(0, maximo - 1).trimEnd()}…`;
