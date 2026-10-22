import {Doto, Poppins} from 'next/font/google';

export const poppins = Poppins({subsets: ['latin'], weight: ['400', '500', '600', '700', '800']});

// fuente pixelada de Oliver Lalan para los creditos del desarrollador
export const doto = Doto({subsets: ['latin'], weight: ['400', '700', '900']});
