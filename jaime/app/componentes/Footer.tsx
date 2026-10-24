import Link from "next/link";
import type {ReactNode} from "react";
import {AnimacionLottie} from "@/app/componentes/AnimacionLottie";
import pochita from "@/app/animaciones/pochita.json";
import jeatdeam from "@/app/animaciones/jeatdeam.json";
import {TextoEscritura} from "@/app/componentes/TextoEscritura";
import {doto} from "@/app/fuentes";

const iconoClase = "w-[18px] h-[18px] shrink-0";

export const IconoWhatsapp = ({className = iconoClase} : {className? : string}) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z"/></svg>
)

const IconoTelefono = () => (
    <svg viewBox="0 0 24 24" className={iconoClase} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.9Z"/></svg>
)

const IconoReloj = () => (
    <svg viewBox="0 0 24 24" className={iconoClase} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
)

const IconoCorreo = () => (
    <svg viewBox="0 0 24 24" className={iconoClase} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>
)

const IconoLibro = () => (
    <svg viewBox="0 0 24 24" className={iconoClase} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/><path d="M9 7h7M9 11h5"/></svg>
)

const IconoEscudo = () => (
    <svg viewBox="0 0 24 24" className={iconoClase} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>
)

const IconoUsuarios = () => (
    <svg viewBox="0 0 24 24" className={iconoClase} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
)

const IconoAuriculares = () => (
    <svg viewBox="0 0 24 24" className={iconoClase} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3ZM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3Z"/></svg>
)

const IconoTarjeta = () => (
    <svg viewBox="0 0 24 24" className={iconoClase} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22M5 15h4"/></svg>
)

const IconoFactura = () => (
    <svg viewBox="0 0 24 24" className={iconoClase} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l3-2 3 2 2-2 2 2 3-2 3 2V2l-3 2-3-2-2 2-2-2-3 2Z"/><path d="M8 9h8M8 13h6"/></svg>
)

const IconoEdificio = () => (
    <svg viewBox="0 0 24 24" className={iconoClase} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/></svg>
)

const IconoTienda = () => (
    <svg viewBox="0 0 24 24" className={iconoClase} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9 4.5 3h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v9h14v-9M10 21v-5h4v5"/></svg>
)

const IconoCaja = () => (
    <svg viewBox="0 0 24 24" className={iconoClase} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>
)

const IconoCasco = () => (
    <svg viewBox="0 0 24 24" className={"w-[34px] h-[34px] shrink-0"} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M2 18h20v-2H2Z"/><path d="M4 16v-3a8 8 0 0 1 16 0v3"/><path d="M10 5.3V10M14 5.3V10"/></svg>
)

const IconoTiktok = () => (
    <svg viewBox="0 0 24 24" className={iconoClase} fill="currentColor"><path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48Z"/></svg>
)

const IconoInstagram = () => (
    <svg viewBox="0 0 24 24" className={iconoClase} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></svg>
)

const IconoFacebook = () => (
    <svg viewBox="0 0 24 24" className={iconoClase} fill="currentColor"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14A28 28 0 0 0 14.64 2C11.93 2 10 3.66 10 6.7v2.8H7v4h3V22h4Z"/></svg>
)

// TODO: reemplazar los "#" por los perfiles reales de la empresa. Tambien las usa la barra superior (BarraSuperior.tsx)
export const REDES_SOCIALES = [
    {nombre: 'TikTok', href: '#', icono: <IconoTiktok/>},
    {nombre: 'Instagram', href: '#', icono: <IconoInstagram/>},
    {nombre: 'Facebook', href: '#', icono: <IconoFacebook/>},
    {nombre: 'WhatsApp', href: 'https://wa.me/51986680850', icono: <IconoWhatsapp/>},
];

const IconoFlecha = () => (
    <svg viewBox="0 0 24 24" className={"w-[16px] h-[16px] shrink-0"} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
)

const Titulo = ({children} : {children : ReactNode}) => (
    <h3 className={"text-[12px] font-semibold uppercase tracking-[.14em] text-slate-900 mb-[18px] leading-none"}>
        {children}
    </h3>
)

const Enlace = ({href, icono, children} : {href : string, icono : ReactNode, children : ReactNode}) => (
    <li>
        <Link href={href} className={"group flex items-center gap-[10px] text-[14px] text-slate-600 hover:text-slate-900 transition-colors"}>
            <span className={"text-slate-500 group-hover:text-sky-700 transition-colors"}>{icono}</span>
            <span className={"group-hover:translate-x-[3px] transition-transform"}>{children}</span>
        </Link>
    </li>
)

const DatoContacto = ({href, icono, children} : {href? : string, icono : ReactNode, children : ReactNode}) => {
    const contenido = (
        <>
            <span className={"size-[34px] shrink-0 rounded-[10px] bg-white/60 ring-1 ring-white flex items-center justify-center text-sky-700"}>{icono}</span>
            <span className={"min-w-0 [overflow-wrap:anywhere]"}>{children}</span>
        </>
    )
    return (
        <li>
            {href
                ? <a href={href} className={"flex items-center gap-[12px] text-[14px] text-slate-600 hover:text-slate-900 transition-colors"}>{contenido}</a>
                : <div className={"flex items-center gap-[12px] text-[14px] text-slate-600"}>{contenido}</div>}
        </li>
    )
}

export const Footer = () => {

    return (
        // azul hielo, un tono mas intenso que el fondo de la pagina para que se distinga
        <footer className={"relative isolate overflow-hidden bg-gradient-to-b from-[#d6ecf8] to-[#b9dff3] border-t border-white/80 text-slate-600 w-full mt-auto"}>
            {/* brillo de fondo sutil */}
            <div aria-hidden={true} className={"pointer-events-none absolute -z-10 -top-[200px] left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-white/50 blur-[120px]"}/>

            {/* llamado a la accion */}
            <div className={"w-[90%] xl:w-[80%] mx-auto pt-[50px]"}>
                <div className={"rounded-[20px] bg-white/55 ring-1 ring-white backdrop-blur shadow-[0px_6px_20px_rgba(15,23,42,.06)] px-[24px] py-[28px] md:px-[40px] flex flex-col md:flex-row gap-[20px] md:items-center justify-between"}>
                    <div>
                        <p className={"text-[12px] font-semibold uppercase tracking-[.14em] text-sky-700"}>Ventas corporativas</p>
                        <h2 className={"mt-[6px] text-[22px] md:text-[26px] font-semibold text-slate-900 leading-none"}>¿Equipas a tu empresa? Cotiza con nosotros.</h2>
                        <p className={"mt-[6px] text-[14px] text-slate-600"}>Atención personalizada para pedidos de EPP por volumen.</p>
                    </div>
                    <div className={"flex flex-wrap gap-[10px] shrink-0"}>
                        <a href="https://wa.me/51986680850" target="_blank" rel="noopener noreferrer" className={"flex items-center gap-[8px] bg-slate-900 hover:bg-slate-700 text-white text-[14px] font-semibold px-[18px] py-[11px] rounded-full transition-colors"}>
                            <IconoWhatsapp/>
                            Cotizar por WhatsApp
                        </a>
                        <Link href={"/productos"} className={"group flex items-center gap-[8px] ring-1 ring-slate-900/20 hover:ring-slate-900/50 text-slate-900 text-[14px] font-semibold px-[18px] py-[11px] rounded-full transition"}>
                            Ver catálogo
                            <span className={"group-hover:translate-x-[3px] transition-transform"}><IconoFlecha/></span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className={"w-[90%] xl:w-[80%] mx-auto py-[50px] grid gap-[40px] grid-cols-1 sm:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr]"}>

                <div className={"sm:col-span-3 lg:col-span-1 flex flex-col gap-[16px]"}>
                    <Link href={"/"} className={"w-fit flex items-center gap-[10px] text-slate-900"}>
                        <span className={"size-[48px] rounded-[14px] bg-sky-700 text-white flex items-center justify-center"}><IconoCasco/></span>
                        <span className={"text-[20px] font-bold leading-tight"}>Los Andes EPPS</span>
                    </Link>
                    <p className={"text-[14px] leading-relaxed"}>
                        Equipos de protección personal y seguridad industrial para minería y construcción.
                    </p>
                    <div className={"mt-[10px]"}>
                        <Titulo>Contáctanos</Titulo>
                        <ul className={"flex flex-col gap-[12px]"}>
                            <DatoContacto href={"tel:+51986680850"} icono={<IconoTelefono/>}>986 680 850</DatoContacto>
                            <DatoContacto icono={<IconoReloj/>}>Lun - Sáb 9:00 am - 6:00 pm</DatoContacto>
                            <DatoContacto href={"mailto:servicioalcliente@rashperu.com"} icono={<IconoCorreo/>}>servicioalcliente@rashperu.com</DatoContacto>
                            <DatoContacto href={"mailto:gerenciasac@rashperu.com"} icono={<IconoCorreo/>}>gerenciasac@rashperu.com</DatoContacto>
                        </ul>
                    </div>
                </div>

                <div>
                    <Titulo>Tienda</Titulo>
                    <ul className={"flex flex-col gap-[12px]"}>
                        <Enlace href={"/productos"} icono={<IconoCaja/>}>Productos</Enlace>
                        <Enlace href={"/productos?oferta=1&orden=descuento"} icono={<IconoTarjeta/>}>Ofertas</Enlace>
                        <Enlace href={"/productos?nuevos=1&orden=recientes"} icono={<IconoTienda/>}>Nuevos ingresos</Enlace>
                    </ul>
                </div>

                <div>
                    <Titulo>Sobre nosotros</Titulo>
                    <ul className={"flex flex-col gap-[12px]"}>
                        <Enlace href={"#"} icono={<IconoUsuarios/>}>¿Quiénes somos?</Enlace>
                        <Enlace href={"#"} icono={<IconoAuriculares/>}>Canales de atención</Enlace>
                        <Enlace href={"#"} icono={<IconoEscudo/>}>Compra fácil y seguro</Enlace>
                        <Enlace href={"#"} icono={<IconoTarjeta/>}>Métodos de pago</Enlace>
                    </ul>
                </div>

                <div>
                    <Titulo>Servicio al cliente</Titulo>
                    <ul className={"flex flex-col gap-[12px]"}>
                        <Enlace href={"#"} icono={<IconoFactura/>}>Factura electrónica</Enlace>
                        <Enlace href={"/ventas-corporativas"} icono={<IconoEdificio/>}>Ventas corporativas</Enlace>
                        <Enlace href={"#"} icono={<IconoTienda/>}>Vende con nosotros</Enlace>
                        <Enlace href={"#"} icono={<IconoCaja/>}>Disponibilidad de productos</Enlace>
                    </ul>
                </div>

            </div>

            {/* redes sociales entre dos lineas que llegan casi al borde del contenedor.
                cada icono usa backCircle como en el header; isolate crea su propio contexto
                para que el circulo (z-index negativo) quede detras del icono y no del fondo del footer */}
            <div id={"redes-footer"} className={"w-[90%] xl:w-[80%] mx-auto flex items-center gap-[10px]"}>
                <span className={"flex-1 h-[1px] bg-gradient-to-r from-transparent to-sky-400/70"}/>
                {REDES_SOCIALES.map(({nombre, href, icono}) => (
                    <a key={nombre} href={href} target="_blank" rel="noopener noreferrer" aria-label={nombre} className={"backCircle relative isolate size-[35px] shrink-0 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-colors duration-300"}>
                        {icono}
                    </a>
                ))}
                <span className={"flex-1 h-[1px] bg-gradient-to-l from-transparent to-sky-400/70"}/>
            </div>

            <div className={"w-[90%] xl:w-[80%] mx-auto py-[22px] flex flex-col md:flex-row gap-[15px] items-center justify-between text-[13px] text-slate-600"}>
                <span className={"text-center md:text-left"}>© {new Date().getFullYear()} Los Andes EPPS – J & M Andes Security E.I.R.L. Todos los derechos reservados.</span>
                <nav aria-label={"Información legal"} className={"flex flex-wrap justify-center gap-x-[16px] gap-y-[6px]"}>
                    <Link href={"/privacidad"} className={"hover:text-slate-900 hover:underline"}>Privacidad</Link>
                    <Link href={"/terminos"} className={"hover:text-slate-900 hover:underline"}>Términos</Link>
                    <Link href={"/eliminacion-de-datos"} className={"hover:text-slate-900 hover:underline"}>Eliminación de datos</Link>
                </nav>
                <Link href={"#"} className={"flex items-center gap-[8px] rounded-full bg-white/60 ring-1 ring-white hover:ring-sky-500/60 hover:text-slate-900 px-[14px] py-[8px] transition"}>
                    <IconoLibro/>
                    Libro de reclamaciones
                </Link>
            </div>

            {/* creditos del desarrollador */}
            <div className={"bg-neutral-900"}>
                {/* en celular la franja es mas baja: solo texto y firma (mas chica), sin pochita */}
                <div className={"w-[90%] xl:w-[80%] mx-auto py-[6px] sm:py-[10px] flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-[12px]"}>
                    <TextoEscritura texto={"Desarrollado y diseñado por:"} className={`${doto.className} text-[12px] sm:text-[14px] font-bold uppercase tracking-[.14em] text-neutral-300`}/>
                    <a href="https://github.com/jeatdeam" target="_blank" rel="noopener noreferrer" aria-label={"Portafolio de jeatdeam en GitHub"} className={"flex items-center shrink-0 hover:opacity-80 transition-opacity"}>
                        {/* la firma escrita queda ~9px arriba del centro de su animacion y con ~24px vacios a la izquierda:
                            se baja y se corre para que quede alineada con el texto */}
                        <AnimacionLottie datos={jeatdeam} className={"w-[134px] h-[56px] translate-y-[3px] -ml-[15px] sm:w-[179px] sm:h-[75px] sm:translate-y-[9px] sm:-ml-[20px] shrink-0"}/>
                        {/* margen negativo: ambas animaciones traen espacio vacio en sus bordes */}
                        <AnimacionLottie datos={pochita} className={"hidden sm:block size-[75px] shrink-0 -ml-[18px]"}/>
                    </a>
                </div>
            </div>
        </footer>
    )
}
