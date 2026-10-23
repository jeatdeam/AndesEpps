import {ImageResponse} from 'next/og';
import {MARCA} from './seo';

// imagen que aparece al compartir el enlace de la tienda por WhatsApp o Facebook.
// las paginas de producto la reemplazan por la foto del producto
export const alt = `${MARCA} – EPP para minería y construcción`;
export const size = {width: 1200, height: 630};
export const contentType = 'image/png';

export default function Image() {
    return new ImageResponse(
        (
            <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', background: '#0f172a', color: '#ffffff'}}>
                <div style={{width: '120px', height: '12px', background: '#facc15', borderRadius: '6px', marginBottom: '40px'}}/>
                <div style={{fontSize: 96, fontWeight: 800, lineHeight: 1}}>{MARCA}</div>
                <div style={{fontSize: 44, marginTop: '28px', color: '#facc15'}}>Equipos de protección personal</div>
                <div style={{fontSize: 36, marginTop: '16px', color: '#cbd5e1'}}>Minería · Construcción · Industria — Lima, Perú</div>
            </div>
        ),
        {...size}
    );
}
