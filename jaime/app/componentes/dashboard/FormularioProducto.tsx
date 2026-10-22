'use client'
import axios from 'axios';
import {clienteAdmin} from './clienteAdmin';
import {useState, useEffect, useRef, type ReactNode} from 'react';
import {Product} from '@/app/tipos/elementsType';
import {formatoPrecio, precioFinal} from '@/app/componentes/elementosProducto';

import {API} from '@/app/configuracion';
export {API};

const MAX_IMAGENES = 8;
const MAX_BYTES = 5 * 1024 * 1024;
const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
// nombre y categoria forman la URL publica del producto (/productos/categoria/nombre)
const CARACTERES_PROHIBIDOS = /[-/?#%]/;

const SUGERENCIAS_NORMAS = ['ANSI Z89.1', 'ANSI Z87.1', 'EN 397', 'EN 166', 'EN 388', 'EN 352', 'ASTM F2413', 'NTP 241.004'];
const SUGERENCIAS_TALLAS = ['S', 'M', 'L', 'XL', 'XXL', 'Estándar'];

// url es la imagen ya guardada o la vista previa (blob) de un archivo nuevo
type ImagenForm = {clave : string, url : string, archivo? : File};

type Formulario = {
    name : string,
    categoria : string,
    precio : string,
    stock : string,
    descuento : string,
    marca : string,
    material : string,
    descripcionPrimaria : string,
    descripcionSecundaria : string[],
    caracteristicas : string[],
    informacionAdicional : string[],
    normas : string[],
    tallas : string[],
    colores : string[],
}

type Errores = Partial<Record<'name' | 'categoria' | 'precio' | 'stock' | 'descuento' | 'img', string>>;

let contadorClaves = 0;
const nuevaClave = () => `img-${++contadorClaves}`;

const formularioInicial = (producto? : Product) : Formulario => ({
    name: producto?.name ?? '',
    categoria: producto?.categoria ?? '',
    precio: producto ? String(producto.precio) : '',
    stock: producto ? String(producto.stock) : '',
    descuento: producto?.descuento ? String(producto.descuento) : '',
    marca: producto?.marca ?? '',
    material: producto?.material ?? '',
    descripcionPrimaria: producto?.descripcionPrimaria ?? '',
    descripcionSecundaria: producto?.descripcionSecundaria ?? [],
    caracteristicas: producto?.caracteristicas ?? [],
    informacionAdicional: producto?.informacionAdicional ?? [],
    normas: producto?.normas ?? [],
    tallas: producto?.tallas ?? [],
    colores: producto?.colores ?? [],
});

const validar = (f : Formulario, imagenes : ImagenForm[]) : Errores => {
    const errores : Errores = {};
    if (!f.name.trim()) errores.name = 'El nombre es obligatorio';
    else if (CARACTERES_PROHIBIDOS.test(f.name)) errores.name = 'No uses los caracteres - / ? # %';
    if (!f.categoria.trim()) errores.categoria = 'La categoría es obligatoria';
    else if (CARACTERES_PROHIBIDOS.test(f.categoria)) errores.categoria = 'No uses los caracteres - / ? # %';
    if (f.precio === '' || Number(f.precio) < 0) errores.precio = 'Ingresa un precio válido';
    if (f.stock === '' || !Number.isInteger(Number(f.stock)) || Number(f.stock) < 0) errores.stock = 'Ingresa un número entero';
    if (f.descuento !== '' && (!Number.isInteger(Number(f.descuento)) || Number(f.descuento) < 0 || Number(f.descuento) > 90)) errores.descuento = 'Entero entre 0 y 90';
    if (imagenes.length === 0) errores.img = 'Agrega al menos una imagen';
    return errores;
}

const claseInput = (error? : string) => `w-full border-2 rounded-[10px] px-[12px] py-[8px] text-[14px] outline-none transition-colors ${error ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-slate-900"}`;

const Seccion = ({titulo, descripcion, children} : {titulo : string, descripcion? : string, children : ReactNode}) => (
    <section className={"flex flex-col gap-[14px] py-[22px] border-b border-gray-200 last:border-b-0"}>
        <div>
            <h3 className={"text-[15px] font-semibold text-gray-900 leading-none"}>{titulo}</h3>
            {descripcion && <p className={"text-[12px] text-gray-500 mt-[2px]"}>{descripcion}</p>}
        </div>
        {children}
    </section>
)

const Campo = ({etiqueta, obligatorio, error, children, className = ''} : {etiqueta : string, obligatorio? : boolean, error? : string, children : ReactNode, className? : string}) => (
    <label className={`flex flex-col gap-[6px] ${className}`}>
        <span className={"text-[13px] font-medium text-gray-700"}>
            {etiqueta}{obligatorio && <span className={"text-red-500"}> *</span>}
        </span>
        {children}
        {error && <span className={"text-[12px] text-red-500"}>{error}</span>}
    </label>
)

const BotonQuitar = ({onClick, etiqueta} : {onClick : () => void, etiqueta : string}) => (
    <button type="button" onClick={onClick} aria-label={etiqueta} className={"shrink-0 w-[34px] h-[34px] rounded-[8px] text-[18px] leading-none text-gray-400 hover:bg-red-50 hover:text-red-500 cursor-pointer transition-colors"}>×</button>
)

const ListaEditable = ({valores, onChange, placeholder, textoAgregar} : {valores : string[], onChange : (v : string[]) => void, placeholder : string, textoAgregar : string}) => (
    <div className={"flex flex-col gap-[8px]"}>
        {valores.map((valor, i) => (
            <div key={i} className={"flex items-center gap-[6px]"}>
                <span className={"w-[20px] text-[12px] text-gray-400 text-right shrink-0"}>{i + 1}.</span>
                <input value={valor} onChange={e => onChange(valores.map((v, j) => j === i ? e.target.value : v))} placeholder={placeholder} className={claseInput()}/>
                <BotonQuitar onClick={() => onChange(valores.filter((_, j) => j !== i))} etiqueta={"Quitar fila"}/>
            </div>
        ))}
        <button type="button" onClick={() => onChange([...valores, ''])} className={"self-start text-[13px] font-semibold text-slate-900 px-[10px] py-[6px] rounded-[8px] hover:bg-gray-100 cursor-pointer"}>
            + {textoAgregar}
        </button>
    </div>
)

const EntradaEtiquetas = ({valores, onChange, placeholder, sugerencias = []} : {valores : string[], onChange : (v : string[]) => void, placeholder : string, sugerencias? : string[]}) => {
    const [texto, setTexto] = useState('');

    const agregar = (valor : string) => {
        const limpio = valor.trim();
        if (limpio && !valores.some(v => v.toLowerCase() === limpio.toLowerCase())) onChange([...valores, limpio]);
        setTexto('');
    }

    const alPresionar = (e : React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            agregar(texto);
        } else if (e.key === 'Backspace' && !texto && valores.length) {
            onChange(valores.slice(0, -1));
        }
    }

    const pendientes = sugerencias.filter(s => !valores.some(v => v.toLowerCase() === s.toLowerCase()));

    return (
        <div className={"flex flex-col gap-[8px]"}>
            <div className={"flex flex-wrap items-center gap-[6px] border-2 border-gray-200 rounded-[10px] px-[8px] py-[6px] focus-within:border-slate-900 transition-colors"}>
                {valores.map(valor => (
                    <span key={valor} className={"flex items-center gap-[4px] bg-slate-900 text-white rounded-full pl-[10px] pr-[4px] py-[2px] text-[12px]"}>
                        {valor}
                        <button type="button" onClick={() => onChange(valores.filter(v => v !== valor))} aria-label={`Quitar ${valor}`} className={"w-[18px] h-[18px] rounded-full hover:bg-white/20 leading-none cursor-pointer"}>×</button>
                    </span>
                ))}
                <input value={texto} onChange={e => setTexto(e.target.value)} onKeyDown={alPresionar} onBlur={() => agregar(texto)} placeholder={valores.length ? '' : placeholder} className={"flex-1 min-w-[120px] text-[14px] py-[2px] outline-none"}/>
            </div>
            {pendientes.length > 0 && (
                <div className={"flex flex-wrap gap-[6px]"}>
                    {pendientes.map(s => (
                        <button type="button" key={s} onClick={() => agregar(s)} className={"text-[12px] border border-dashed border-gray-300 rounded-full px-[10px] py-[2px] text-gray-600 hover:border-slate-900 hover:text-slate-900 cursor-pointer"}>
                            + {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export const FormularioProducto = ({producto, categorias, onCerrar, onGuardado} : {producto? : Product, categorias : string[], onCerrar : () => void, onGuardado : (producto : Product, esNuevo : boolean) => void}) => {

    const [form, setForm] = useState<Formulario>(() => formularioInicial(producto));
    const [imagenes, setImagenes] = useState<ImagenForm[]>(() => (producto?.img ?? []).map(url => ({clave: nuevaClave(), url})));
    const [errores, setErrores] = useState<Errores>({});
    const [errorServidor, setErrorServidor] = useState('');
    const [avisoImagenes, setAvisoImagenes] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [arrastrando, setArrastrando] = useState(false);

    // las vistas previas de archivos nuevos son blobs en memoria: se liberan al cerrar el formulario
    const imagenesActuales = useRef(imagenes);
    const cambiarImagenes = (nuevas : ImagenForm[]) => {
        imagenesActuales.current = nuevas;
        setImagenes(nuevas);
    }
    useEffect(() => () => imagenesActuales.current.forEach(i => i.archivo && URL.revokeObjectURL(i.url)), []);

    useEffect(() => {
        const alPresionar = (e : KeyboardEvent) => { if (e.key === 'Escape' && !guardando) onCerrar(); };
        document.addEventListener('keydown', alPresionar);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', alPresionar);
            document.body.style.overflow = '';
        };
    }, [guardando, onCerrar]);

    const cambiar = <K extends keyof Formulario>(campo : K, valor : Formulario[K]) => {
        setForm(f => ({...f, [campo]: valor}));
        if (campo in errores) setErrores(e => ({...e, [campo]: undefined}));
    }

    const agregarArchivos = (archivos : FileList | null) => {
        if (!archivos) return;
        const rechazados : string[] = [];
        const nuevas : ImagenForm[] = [];
        for (const archivo of Array.from(archivos)) {
            if (!TIPOS_IMAGEN.includes(archivo.type)) rechazados.push(`${archivo.name} (formato no permitido)`);
            else if (archivo.size > MAX_BYTES) rechazados.push(`${archivo.name} (pesa más de 5 MB)`);
            else if (imagenes.length + nuevas.length >= MAX_IMAGENES) rechazados.push(`${archivo.name} (máximo ${MAX_IMAGENES} imágenes)`);
            else nuevas.push({clave: nuevaClave(), url: URL.createObjectURL(archivo), archivo});
        }
        cambiarImagenes([...imagenes, ...nuevas]);
        setAvisoImagenes(rechazados.length ? `No se agregaron: ${rechazados.join(', ')}` : '');
        if (nuevas.length) setErrores(e => ({...e, img: undefined}));
    }

    const quitarImagen = (clave : string) => {
        const imagen = imagenes.find(i => i.clave === clave);
        if (imagen?.archivo) URL.revokeObjectURL(imagen.url);
        cambiarImagenes(imagenes.filter(i => i.clave !== clave));
    }

    const moverImagen = (indice : number, destino : number) => {
        if (destino < 0 || destino >= imagenes.length) return;
        const copia = [...imagenes];
        const [imagen] = copia.splice(indice, 1);
        copia.splice(destino, 0, imagen!);
        cambiarImagenes(copia);
    }

    const guardar = async (e : React.FormEvent) => {
        e.preventDefault();
        const encontrados = validar(form, imagenes);
        setErrores(encontrados);
        setErrorServidor('');
        if (Object.keys(encontrados).length) return;

        // los archivos nuevos viajan aparte y en "img" se marca su posicion con {nuevo: indice}
        const archivos : File[] = [];
        const img = imagenes.map(i => i.archivo ? {nuevo: archivos.push(i.archivo) - 1} : i.url);
        const datos = new FormData();
        datos.append('datos', JSON.stringify({...form, img}));
        archivos.forEach(archivo => datos.append('imagenes', archivo));

        setGuardando(true);
        try {
            const {data} = producto
                ? await clienteAdmin.put<Product>(`${API}/productos/${producto.id}`, datos)
                : await clienteAdmin.post<Product>(`${API}/productos`, datos);
            onGuardado(data, !producto);
        } catch (error) {
            setErrorServidor(axios.isAxiosError(error) && error.response?.data?.error ? error.response.data.error : 'No se pudo guardar el producto. Revisa que el servidor esté encendido.');
            setGuardando(false);
        }
    }

    return (
        <div className={"fixed inset-0 z-[60] flex items-center justify-center p-[16px]"}>
            <div onClick={() => !guardando && onCerrar()} className={"absolute inset-0 bg-black/50"}/>
            <form onSubmit={guardar} role="dialog" aria-modal="true" aria-labelledby="titulo-formulario" noValidate className={"relative w-full max-w-[860px] max-h-[92vh] bg-white rounded-[16px] shadow-[0px_10px_40px_rgba(0,0,0,.25)] flex flex-col overflow-hidden"}>

                <header className={"flex items-center justify-between gap-[12px] px-[24px] py-[16px] border-b border-gray-200"}>
                    <div>
                        <h2 id="titulo-formulario" className={"text-[18px] font-bold text-gray-900 leading-none"}>{producto ? 'Editar producto' : 'Nuevo producto'}</h2>
                        <p className={"text-[12px] text-gray-500"}>
                            {producto ? `ID #${String(producto.id).padStart(5, '0')}` : 'El ID se asigna automáticamente al guardar'}
                        </p>
                    </div>
                    <BotonQuitar onClick={onCerrar} etiqueta={"Cerrar"}/>
                </header>

                <div className={"flex-1 overflow-y-auto scroll-fino px-[24px]"}>
                    <Seccion titulo={"Información básica"}>
                        <div className={"grid grid-cols-1 sm:grid-cols-2 gap-[14px]"}>
                            <Campo etiqueta={"Nombre"} obligatorio error={errores.name} className={"sm:col-span-2"}>
                                <input value={form.name} onChange={e => cambiar('name', e.target.value)} placeholder={"Ej. casco de seguridad dieléctrico"} className={claseInput(errores.name)}/>
                            </Campo>
                            <Campo etiqueta={"Categoría"} obligatorio error={errores.categoria}>
                                <input value={form.categoria} onChange={e => cambiar('categoria', e.target.value)} list="categorias-dashboard" placeholder={"Elige o escribe una categoría"} className={claseInput(errores.categoria)}/>
                                <datalist id="categorias-dashboard">
                                    {categorias.map(c => <option key={c} value={c}/>)}
                                </datalist>
                            </Campo>
                            <Campo etiqueta={"Marca"}>
                                <input value={form.marca} onChange={e => cambiar('marca', e.target.value)} placeholder={"Ej. 3M, MSA, Steelpro"} className={claseInput()}/>
                            </Campo>
                            <Campo etiqueta={"Precio (S/)"} obligatorio error={errores.precio}>
                                <input type="number" min={0} step={0.01} inputMode="decimal" value={form.precio} onChange={e => cambiar('precio', e.target.value)} placeholder={"0.00"} className={claseInput(errores.precio)}/>
                            </Campo>
                            <Campo etiqueta={"Stock (unidades)"} obligatorio error={errores.stock}>
                                <input type="number" min={0} step={1} inputMode="numeric" value={form.stock} onChange={e => cambiar('stock', e.target.value)} placeholder={"0"} className={claseInput(errores.stock)}/>
                            </Campo>
                            <Campo etiqueta={"Descuento (%)"} error={errores.descuento}>
                                <input type="number" min={0} max={90} step={1} inputMode="numeric" value={form.descuento} onChange={e => cambiar('descuento', e.target.value)} placeholder={"Sin descuento"} className={claseInput(errores.descuento)}/>
                            </Campo>
                            {/* vista previa del precio que vera el cliente; el producto aparece en ofertas y banners */}
                            <div className={"flex flex-col justify-end gap-[2px] pb-[2px]"}>
                                <span className={"text-[13px] font-medium text-gray-700"}>Precio final</span>
                                {Number(form.descuento) > 0 && !errores.descuento && form.precio !== '' ? (
                                    <span className={"flex items-baseline gap-[8px] py-[8px]"}>
                                        <span className={"text-[18px] font-bold text-red-600"}>{formatoPrecio(precioFinal({precio: Number(form.precio), descuento: Number(form.descuento)}))}</span>
                                        <span className={"text-[13px] text-gray-400 line-through"}>{formatoPrecio(Number(form.precio))}</span>
                                    </span>
                                ) : (
                                    <span className={"text-[14px] text-gray-500 py-[10px]"}>{form.precio !== '' ? `${formatoPrecio(Number(form.precio))} (sin oferta)` : '—'}</span>
                                )}
                            </div>
                            <Campo etiqueta={"Material"} className={"sm:col-span-2"}>
                                <input value={form.material} onChange={e => cambiar('material', e.target.value)} placeholder={"Ej. polietileno de alta densidad"} className={claseInput()}/>
                            </Campo>
                        </div>
                    </Seccion>

                    <Seccion titulo={"Imágenes"} descripcion={`La primera es la imagen principal. Hasta ${MAX_IMAGENES} imágenes JPG, PNG, WEBP, GIF o AVIF de 5 MB como máximo.`}>
                        <label
                            onDragOver={e => { e.preventDefault(); setArrastrando(true); }}
                            onDragLeave={() => setArrastrando(false)}
                            onDrop={e => { e.preventDefault(); setArrastrando(false); agregarArchivos(e.dataTransfer.files); }}
                            className={`flex flex-col items-center justify-center gap-[6px] border-2 border-dashed rounded-[12px] py-[24px] px-[16px] text-center cursor-pointer transition-colors ${arrastrando ? "border-slate-900 bg-slate-50" : errores.img ? "border-red-400" : "border-gray-300 hover:border-slate-900"}`}>
                            <svg viewBox="0 0 24 24" className={"w-[28px] h-[28px] text-gray-400"} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                            </svg>
                            <span className={"text-[14px] font-medium text-gray-700"}>Arrastra imágenes aquí o <span className={"underline"}>haz clic para elegir</span></span>
                            <span className={"text-[12px] text-gray-500"}>{imagenes.length} de {MAX_IMAGENES} imágenes</span>
                            <input type="file" accept={TIPOS_IMAGEN.join(',')} multiple className={"hidden"} onChange={e => { agregarArchivos(e.target.files); e.target.value = ''; }}/>
                        </label>
                        {errores.img && <span className={"text-[12px] text-red-500"}>{errores.img}</span>}
                        {avisoImagenes && <span className={"text-[12px] text-amber-600"}>{avisoImagenes}</span>}

                        {imagenes.length > 0 && (
                            <div className={"grid grid-cols-2 sm:grid-cols-4 gap-[12px]"}>
                                {imagenes.map((imagen, i) => (
                                    <div key={imagen.clave} className={`relative group rounded-[10px] border-2 overflow-hidden bg-white ${i === 0 ? "border-slate-900" : "border-gray-200"}`}>
                                        <img src={imagen.url} alt={`Imagen ${i + 1}`} className={"w-full aspect-square object-contain"}/>
                                        {i === 0 && <span className={"absolute top-[6px] left-[6px] bg-slate-900 text-white text-[10px] font-semibold uppercase tracking-wide rounded-full px-[8px] py-[2px]"}>Principal</span>}
                                        {imagen.archivo && <span className={"absolute top-[6px] right-[6px] bg-green-600 text-white text-[10px] font-semibold rounded-full px-[8px] py-[2px]"}>Nueva</span>}
                                        <div className={"absolute inset-x-0 bottom-0 flex justify-between gap-[4px] p-[6px] bg-gradient-to-t from-black/60 to-transparent"}>
                                            <div className={"flex gap-[4px]"}>
                                                <button type="button" onClick={() => moverImagen(i, i - 1)} disabled={i === 0} aria-label={"Mover a la izquierda"} className={"w-[26px] h-[26px] rounded-[6px] bg-white/90 text-[13px] disabled:opacity-40 cursor-pointer disabled:cursor-default"}>←</button>
                                                <button type="button" onClick={() => moverImagen(i, i + 1)} disabled={i === imagenes.length - 1} aria-label={"Mover a la derecha"} className={"w-[26px] h-[26px] rounded-[6px] bg-white/90 text-[13px] disabled:opacity-40 cursor-pointer disabled:cursor-default"}>→</button>
                                            </div>
                                            <button type="button" onClick={() => quitarImagen(imagen.clave)} aria-label={"Quitar imagen"} className={"w-[26px] h-[26px] rounded-[6px] bg-white/90 text-red-600 text-[16px] leading-none cursor-pointer"}>×</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Seccion>

                    <Seccion titulo={"Descripción"}>
                        <Campo etiqueta={"Descripción principal"}>
                            <textarea value={form.descripcionPrimaria} onChange={e => cambiar('descripcionPrimaria', e.target.value)} rows={3} placeholder={"Resumen que se muestra en la tarjeta y al inicio del detalle"} className={`${claseInput()} resize-y`}/>
                        </Campo>
                        <div className={"flex flex-col gap-[6px]"}>
                            <span className={"text-[13px] font-medium text-gray-700"}>Descripción detallada (párrafos)</span>
                            <ListaEditable valores={form.descripcionSecundaria} onChange={v => cambiar('descripcionSecundaria', v)} placeholder={"Párrafo de descripción"} textoAgregar={"Agregar párrafo"}/>
                        </div>
                    </Seccion>

                    <Seccion titulo={"Características"} descripcion={"Puntos clave del producto, uno por fila."}>
                        <ListaEditable valores={form.caracteristicas} onChange={v => cambiar('caracteristicas', v)} placeholder={"Ej. Suspensión de 4 puntos con ajuste tipo ratchet"} textoAgregar={"Agregar característica"}/>
                    </Seccion>

                    <Seccion titulo={"Información adicional"} descripcion={"Datos técnicos o de uso, uno por fila."}>
                        <ListaEditable valores={form.informacionAdicional} onChange={v => cambiar('informacionAdicional', v)} placeholder={"Ej. Peso: 380 g"} textoAgregar={"Agregar dato"}/>
                    </Seccion>

                    <Seccion titulo={"Atributos de EPP"} descripcion={"Se usan en los filtros del catálogo. Escribe y presiona Enter para agregar."}>
                        <Campo etiqueta={"Normas / certificaciones"}>
                            <EntradaEtiquetas valores={form.normas} onChange={v => cambiar('normas', v)} placeholder={"Ej. ANSI Z89.1"} sugerencias={SUGERENCIAS_NORMAS}/>
                        </Campo>
                        <Campo etiqueta={"Tallas"}>
                            <EntradaEtiquetas valores={form.tallas} onChange={v => cambiar('tallas', v)} placeholder={"Ej. M"} sugerencias={SUGERENCIAS_TALLAS}/>
                        </Campo>
                        <Campo etiqueta={"Colores"}>
                            <EntradaEtiquetas valores={form.colores} onChange={v => cambiar('colores', v)} placeholder={"Ej. blanco"}/>
                        </Campo>
                    </Seccion>
                </div>

                <footer className={"flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-[12px] px-[24px] py-[14px] border-t border-gray-200 bg-gray-50"}>
                    <span className={"text-[13px] text-red-600"} role="alert">{errorServidor || (Object.values(errores).some(Boolean) ? 'Revisa los campos marcados.' : '')}</span>
                    <div className={"flex gap-[10px] justify-end"}>
                        <button type="button" onClick={onCerrar} disabled={guardando} className={"px-[16px] py-[9px] rounded-[10px] text-[14px] font-semibold text-gray-700 hover:bg-gray-200 cursor-pointer disabled:opacity-50"}>Cancelar</button>
                        <button type="submit" disabled={guardando} className={"px-[18px] py-[9px] rounded-[10px] text-[14px] font-semibold bg-slate-900 text-white hover:bg-slate-700 cursor-pointer disabled:opacity-60 disabled:cursor-wait"}>
                            {guardando ? 'Guardando...' : producto ? 'Guardar cambios' : 'Crear producto'}
                        </button>
                    </div>
                </footer>
            </form>
        </div>
    )
}
