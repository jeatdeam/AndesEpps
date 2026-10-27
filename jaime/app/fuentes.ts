import {Doto, Playfair_Display, Raleway} from 'next/font/google';

// raleway para textos y descripciones, playfair para los titulos (h1-h6, ver globals.css)
export const raleway = Raleway({subsets: ['latin'], variable: '--font-raleway'});
export const playfair = Playfair_Display({subsets: ['latin'], variable: '--font-playfair'});

// fuente pixelada de Oliver Lalan para los creditos del desarrollador
export const doto = Doto({subsets: ['latin'], weight: ['400', '700', '900']});
