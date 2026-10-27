import type { Metadata } from "next";
import {Header} from "./componentes/Header";
import {BarraSuperior} from "./componentes/BarraSuperior";
import {Footer} from "./componentes/Footer";
import {CreditosDesarrollador} from "./componentes/CreditosDesarrollador";
import {SegunSeccion} from "./componentes/SegunSeccion";
import {FormularioCotizacion} from "./componentes/FormularioCotizacion";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import {raleway, playfair} from "./fuentes";
import {SITIO, MARCA, TITULO_SITIO, DESCRIPCION_SITIO} from "./seo";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// cada pagina puede cambiar el titulo; la plantilla le agrega la marca al final.
// la url canonica la define cada pagina (si se pusiera aqui, todas apuntarian al inicio)
export const metadata: Metadata = {
  metadataBase: new URL(SITIO),
  title: {
    default: TITULO_SITIO,
    template: `%s | ${MARCA}`,
  },
  description: DESCRIPCION_SITIO,
  applicationName: MARCA,
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: MARCA,
    title: TITULO_SITIO,
    description: DESCRIPCION_SITIO,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${raleway.variable} ${playfair.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
      {/* el dashboard no lleva barra superior, header ni footer: solo los creditos del desarrollador al fondo */}
      <SegunSeccion tienda={<><BarraSuperior/><Header/></>}/>
      {children}
      <SegunSeccion tienda={<Footer/>} dashboard={<div className={"mt-auto"}><CreditosDesarrollador/></div>}/>
      <FormularioCotizacion/>
      </body>
    </html>
  );
}
