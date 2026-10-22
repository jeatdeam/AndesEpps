'use client'
import axios from 'axios';
import {useState, useEffect, useRef, type ReactNode} from 'react';
import {useControladorCotizacion} from '@/app/controladoresGlobales/controladorCotizacion';
import type {ProductoCarrito} from '@/app/controladoresGlobales/controladorCarrito';
import {API} from '@/app/configuracion';
import {poppins} from '@/app/fuentes';
import {formatoPrecio, IconoCotizar} from './elementosProducto';
import {IconoWhatsapp} from './Footer';

type Canal = 'correo' | 'whatsapp';
type EstadoEnvio = 'enviado' | 'no-solicitado' | 'no-configurado' | 'error';
type Respuesta = {numero : string, archivo : string, total : number, pdf : string, correo : EstadoEnvio, whatsapp : EstadoEnvio};
type DatosCliente = {nombre : string, empresa : string, documento : string, correo : string, whatsapp : string, mensaje : string};

const MAX_CANTIDAD = 9999;
const CLAVE_CLIENTE = 'datosCotizacion';
const CLIENTE_VACIO : DatosCliente = {nombre: '', empresa: '', documento: '', correo: '', whatsapp: '', mensaje: ''};

// recuerda los datos del cliente en este navegador para no volver a escribirlos (sin el mensaje)
const leerCliente = () : DatosCliente => {
    try {
        return {...CLIENTE_VACIO, ...JSON.parse(localStorage.getItem(CLAVE_CLIENTE) ?? '{}'), mensaje: ''};
    } catch {
        return CLIENTE_VACIO;
    }
}
const guardarCliente = (datos : DatosCliente) => {
    try { localStorage.setItem(CLAVE_CLIENTE, JSON.stringify({...datos, mensaje: ''})); } catch {}
}

const mensajeError = (err : unknown, porDefecto : string) =>
    axios.isAxiosError(err) && err.response?.data?.error ? err.response.data.error as string : porDefecto;

const claseInput = "w-full rounded-[10px] border border-gray-300 bg-white px-[12px] py-[9px] text-[14px] outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10";

const Campo = ({etiqueta, opcional, className = '', children} : {etiqueta : string, opcional? : boolean, className? : string, children : ReactNode}) => (
    <label className={`flex flex-col gap-[5px] ${className}`}>
        <span className={"text-[13px] font-medium text-gray-700"}>
            {etiqueta} {opcional && <span className={"font-normal text-gray-400"}>(opcional)</span>}
        </span>
        {children}
    </label>
)

const IconoCerrar = () => (
    <svg viewBox="0 0 24 24" className={"w-[18px] h-[18px]"} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
)

const IconoAtras = () => (
    <svg viewBox="0 0 24 24" className={"w-[18px] h-[18px]"} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
)

const IconoSobre = () => (
    <svg viewBox="0 0 24 24" className={"w-[18px] h-[18px]"} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>
)

const Giro = () => <span className={"size-[15px] rounded-full border-2 border-current/30 border-t-current animate-spin"}/>;

const CANALES : Record<Canal, {titulo : string, boton : string, tipo : string, placeholder : string, colorIcono : string, icono : ReactNode}> = {
    correo : {titulo: 'Correo', boton: 'Enviar al correo', tipo: 'email', placeholder: 'tucorreo@empresa.com', colorIcono: 'bg-blue-100 text-blue-700', icono: <IconoSobre/>},
    whatsapp : {titulo: 'WhatsApp', boton: 'Enviar a WhatsApp', tipo: 'tel', placeholder: '987 654 321', colorIcono: 'bg-green-100 text-green-700', icono: <IconoWhatsapp className={"w-[18px] h-[18px]"}/>},
};

// tarjeta seleccionable del formulario: el cliente elige por donde recibir la cotizacion
const OpcionCanal = ({canal, marcado, disponible, cambiar} : {canal : Canal, marcado : boolean, disponible : boolean | null, cambiar : (marcado : boolean) => void}) => {
    const {titulo, icono, colorIcono} = CANALES[canal];
    const bloqueado = disponible === false;
    return (
        <label className={`flex items-center gap-[10px] rounded-[12px] border px-[12px] py-[10px] transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-slate-900/20 ${bloqueado ? "border-gray-200 opacity-55 cursor-not-allowed" : marcado ? "border-slate-900 bg-slate-50 cursor-pointer" : "border-gray-300 hover:border-gray-400 cursor-pointer"}`}>
            <input type={"checkbox"} className={"sr-only"} checked={marcado} disabled={bloqueado} onChange={e => cambiar(e.target.checked)}/>
            <span className={`size-[34px] shrink-0 rounded-[10px] flex items-center justify-center ${colorIcono}`}>{icono}</span>
            <span className={"flex-1 min-w-0 flex flex-col"}>
                <span className={"text-[14px] font-semibold"}>{titulo}</span>
                <span className={"text-[12px] text-gray-500"}>{bloqueado ? 'No disponible por ahora' : 'Recibe el PDF aquí'}</span>
            </span>
            <span aria-hidden={true} className={`size-[20px] shrink-0 rounded-[6px] border-2 flex items-center justify-center transition-colors ${marcado ? "bg-slate-900 border-slate-900 text-white" : "border-gray-300"}`}>
                {marcado && <svg viewBox="0 0 24 24" className={"w-[13px] h-[13px]"} fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>}
            </span>
        </label>
    )
}

const ETIQUETA_ESTADO : Record<EstadoEnvio, [string, string]> = {
    'enviado' : ['Enviada', 'bg-green-100 text-green-800'],
    'error' : ['No se pudo enviar', 'bg-red-100 text-red-700'],
    'no-solicitado' : ['Sin enviar', 'bg-gray-100 text-gray-600'],
    'no-configurado' : ['No disponible', 'bg-gray-100 text-gray-600'],
};

// en la pantalla final: envia (o reenvia) la cotizacion ya generada por un canal, a un destino editable
const EnvioCanal = ({canal, archivo, destinoInicial, estadoInicial, disponible} : {canal : Canal, archivo : string, destinoInicial : string, estadoInicial : EstadoEnvio, disponible : boolean}) => {

    const [estado, setEstado] = useState(estadoInicial);
    const [destino, setDestino] = useState(destinoInicial);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');
    const {titulo, boton, tipo, placeholder, icono, colorIcono} = CANALES[canal];
    const [textoEstado, colorEstado] = ETIQUETA_ESTADO[disponible ? estado : 'no-configurado'];

    const enviar = async (e : React.FormEvent) => {
        e.preventDefault();
        setEnviando(true);
        setError('');
        try {
            const {data} = await axios.post<{estado : EstadoEnvio}>(`${API}/cotizaciones/enviar`, {archivo, canal, destino});
            setEstado(data.estado);
            if (data.estado === 'error') setError('No se pudo enviar. Revisa el dato e inténtalo de nuevo.');
        } catch (err) {
            setError(mensajeError(err, 'No se pudo conectar con el servidor.'));
        } finally {
            setEnviando(false);
        }
    }

    return (
        <li className={"flex flex-col gap-[10px] rounded-[12px] border border-gray-200 p-[12px]"}>
            <div className={"flex items-center gap-[10px]"}>
                <span className={`size-[32px] shrink-0 rounded-[10px] flex items-center justify-center ${colorIcono}`}>{icono}</span>
                <span className={"flex-1 text-[14px] font-semibold"}>{titulo}</span>
                <span className={`shrink-0 text-[12px] font-semibold rounded-full px-[10px] py-[4px] ${colorEstado}`}>{textoEstado}</span>
            </div>
            {disponible ? (
                <form onSubmit={enviar} className={"flex flex-col sm:flex-row gap-[8px]"}>
                    <input type={tipo} required value={destino} onChange={e => setDestino(e.target.value)} placeholder={placeholder} aria-label={`${titulo} de destino`}
                        {...(canal === 'whatsapp' ? {inputMode: 'tel' as const, pattern: '[0-9 +()\\-]{9,20}', title: 'Celular de 9 dígitos o número con código de país'} : {})}
                        className={`${claseInput} flex-1 min-w-0`}/>
                    <button type={"submit"} disabled={enviando} className={"shrink-0 flex items-center justify-center gap-[8px] rounded-[10px] border-2 border-slate-900 px-[14px] py-[8px] text-[13px] font-semibold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"}>
                        {enviando && <Giro/>}
                        {estado === 'enviado' ? 'Reenviar' : boton}
                    </button>
                </form>
            ) : (
                <p className={"text-[12px] text-gray-500"}>Este medio de envío aún no está activado en la tienda.</p>
            )}
            {error && <p role={"alert"} className={"text-[12px] text-red-700"}>{error}</p>}
        </li>
    )
}

const Modal = ({productosIniciales, cerrar} : {productosIniciales : ProductoCarrito[], cerrar : () => void}) => {

    const [productos, setProductos] = useState(productosIniciales);
    const [cliente, setCliente] = useState(leerCliente);
    // canales configurados en el servidor (null mientras se consulta)
    const [disponibles, setDisponibles] = useState<Record<Canal, boolean> | null>(null);
    const [elegidos, setElegidos] = useState<Record<Canal, boolean>>({correo: true, whatsapp: true});
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');
    const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
    const primerCampo = useRef<HTMLInputElement>(null);

    // bloquea el scroll de la pagina, enfoca el primer campo y consulta los canales disponibles
    useEffect(() => {
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        primerCampo.current?.focus();
        axios.get<Record<Canal, boolean>>(`${API}/cotizaciones/canales`)
            .then(({data}) => setDisponibles(data))
            .catch(() => setDisponibles({correo: false, whatsapp: false}));
        return () => { document.body.style.overflow = overflow; };
    }, []);

    useEffect(() => {
        const alPresionar = (e : KeyboardEvent) => { if (e.key === 'Escape' && !enviando) cerrar(); };
        window.addEventListener('keydown', alPresionar);
        return () => window.removeEventListener('keydown', alPresionar);
    }, [enviando, cerrar]);

    // un canal se usa si el cliente lo marco y el servidor lo tiene configurado
    const usar = (canal : Canal) => elegidos[canal] && disponibles?.[canal] === true;
    const algunCanal = usar('correo') || usar('whatsapp');

    const cambiar = (campo : keyof DatosCliente) => (e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setCliente({...cliente, [campo]: e.target.value});

    const cambiarCantidad = (id : number, cantidad : number) =>
        setProductos(productos.map(p => p.id === id ? {...p, cantidad: Math.min(MAX_CANTIDAD, Math.max(1, Math.floor(cantidad) || 1))} : p));

    const total = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

    const enviar = async (e : React.FormEvent) => {
        e.preventDefault();
        setEnviando(true);
        setError('');
        guardarCliente(cliente);
        try {
            const {data} = await axios.post<Respuesta>(`${API}/cotizaciones`, {
                cliente,
                canales : {correo: usar('correo'), whatsapp: usar('whatsapp')},
                productos : productos.map(p => ({id: p.id, cantidad: p.cantidad})),
            });
            setRespuesta(data);
        } catch (err) {
            setError(mensajeError(err, 'No se pudo conectar con el servidor. Inténtalo de nuevo en unos minutos.'));
        } finally {
            setEnviando(false);
        }
    }

    const enviadaPorAlgunCanal = respuesta && (respuesta.correo === 'enviado' || respuesta.whatsapp === 'enviado');

    return (
        <div className={"fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-[2px] p-[16px]"} onMouseDown={e => { if (e.target === e.currentTarget && !enviando) cerrar(); }}>
            <div role={"dialog"} aria-modal={true} aria-labelledby={"titulo-cotizacion"} className={`${poppins.className} w-full max-w-[680px] max-h-[92vh] flex flex-col overflow-hidden rounded-[16px] bg-white text-gray-900 shadow-[0px_20px_60px_rgba(0,0,0,.35)]`}>

                <div className={"flex items-start justify-between gap-[12px] border-b border-gray-200 px-[22px] py-[16px]"}>
                    <div className={"flex items-center gap-[12px]"}>
                        {/* desde la pantalla final vuelve al formulario con los datos ya escritos para corregirlos */}
                        {respuesta ? (
                            <button type={"button"} onClick={() => setRespuesta(null)} aria-label={"Volver al formulario"} title={"Volver y modificar datos"} className={"size-[40px] shrink-0 rounded-[12px] border border-gray-300 text-gray-700 flex items-center justify-center hover:border-slate-900 hover:text-slate-900 transition-colors cursor-pointer"}>
                                <IconoAtras/>
                            </button>
                        ) : (
                            <span className={"size-[40px] shrink-0 rounded-[12px] bg-yellow-400 text-slate-900 flex items-center justify-center"}><IconoCotizar/></span>
                        )}
                        <div>
                            <h2 id={"titulo-cotizacion"} className={"text-[18px] font-bold leading-none"}>Solicitar cotización</h2>
                            <p className={"text-[13px] text-gray-500"}>Recíbela por correo, WhatsApp o descárgala en PDF.</p>
                        </div>
                    </div>
                    <button type={"button"} onClick={cerrar} disabled={enviando} aria-label={"Cerrar"} className={"size-[34px] shrink-0 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer disabled:opacity-40"}>
                        <IconoCerrar/>
                    </button>
                </div>

                {respuesta ? (
                    <div className={"overflow-y-auto scroll-fino px-[22px] py-[24px] flex flex-col items-center gap-[16px]"}>
                        <span className={"size-[60px] rounded-full bg-green-100 text-green-600 flex items-center justify-center"}>
                            <svg viewBox="0 0 24 24" className={"w-[30px] h-[30px]"} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
                        </span>
                        <div className={"text-center"}>
                            <h3 className={"text-[20px] font-bold leading-none"}>{enviadaPorAlgunCanal ? '¡Cotización enviada!' : 'Tu cotización está lista'}</h3>
                            <p className={"text-[14px] text-gray-500"}>N° {respuesta.numero} · Total {formatoPrecio(respuesta.total)}</p>
                        </div>

                        <ul className={"w-full max-w-[460px] flex flex-col gap-[10px]"}>
                            {(['correo', 'whatsapp'] as const).map(canal => (
                                <EnvioCanal key={canal} canal={canal} archivo={respuesta.archivo} destinoInicial={cliente[canal]} estadoInicial={respuesta[canal]} disponible={disponibles?.[canal] === true}/>
                            ))}
                        </ul>

                        <div className={"flex flex-wrap justify-center gap-[10px] mt-[4px]"}>
                            <a href={`${API}${respuesta.pdf}`} target={"_blank"} rel={"noopener noreferrer"} className={"flex items-center gap-[8px] rounded-[10px] bg-slate-900 px-[18px] py-[10px] text-[14px] font-semibold text-white hover:bg-slate-700 transition-colors"}>
                                <IconoCotizar/>
                                Descargar PDF
                            </a>
                            <button type={"button"} onClick={cerrar} className={"rounded-[10px] border-2 border-gray-300 px-[18px] py-[8px] text-[14px] font-semibold hover:border-slate-900 transition-colors cursor-pointer"}>Cerrar</button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={enviar} className={"flex flex-col min-h-0"}>
                        <div className={"overflow-y-auto scroll-fino px-[22px] py-[18px] flex flex-col gap-[20px]"}>

                            <section className={"flex flex-col gap-[10px]"}>
                                <h3 className={"text-[12px] font-semibold uppercase tracking-[.12em] text-gray-500 leading-none"}>Productos ({productos.length})</h3>
                                <ul className={"flex flex-col divide-y divide-gray-100 rounded-[12px] border border-gray-200"}>
                                    {productos.map(p => (
                                        <li key={p.id} className={"flex items-center gap-[12px] px-[12px] py-[10px]"}>
                                            <img src={p.img} alt={""} className={"size-[46px] shrink-0 rounded-[8px] border border-gray-100 object-contain bg-white"}/>
                                            <div className={"flex-1 min-w-0"}>
                                                <p className={"text-[14px] font-medium leading-snug line-clamp-2 first-letter:uppercase"}>{p.name}</p>
                                                <p className={"text-[12px] text-gray-500"}>{formatoPrecio(p.precio)} c/u</p>
                                            </div>
                                            <div className={"flex items-center rounded-[8px] border border-gray-300"}>
                                                <button type={"button"} onClick={() => cambiarCantidad(p.id, p.cantidad - 1)} aria-label={"Restar uno"} className={"size-[30px] text-[16px] text-gray-600 hover:text-gray-900 cursor-pointer"}>−</button>
                                                <input type={"number"} min={1} max={MAX_CANTIDAD} value={p.cantidad} onChange={e => cambiarCantidad(p.id, Number(e.target.value))} aria-label={`Cantidad de ${p.name}`} className={"w-[46px] text-center text-[14px] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"}/>
                                                <button type={"button"} onClick={() => cambiarCantidad(p.id, p.cantidad + 1)} aria-label={"Sumar uno"} className={"size-[30px] text-[16px] text-gray-600 hover:text-gray-900 cursor-pointer"}>+</button>
                                            </div>
                                            {productos.length > 1 && (
                                                <button type={"button"} onClick={() => setProductos(productos.filter(x => x.id !== p.id))} aria-label={`Quitar ${p.name}`} className={"size-[28px] shrink-0 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"}>
                                                    <IconoCerrar/>
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                <div className={"flex items-center justify-between px-[4px] text-[14px]"}>
                                    <span className={"text-gray-500"}>Total estimado <span className={"text-[12px]"}>(incluye IGV)</span></span>
                                    <span className={"text-[16px] font-bold"}>{formatoPrecio(total)}</span>
                                </div>
                            </section>

                            <section className={"flex flex-col gap-[10px]"}>
                                <h3 className={"text-[12px] font-semibold uppercase tracking-[.12em] text-gray-500 leading-none"}>¿Dónde quieres recibirla?</h3>
                                <div className={"grid grid-cols-1 sm:grid-cols-2 gap-[10px]"}>
                                    {(['correo', 'whatsapp'] as const).map(canal => (
                                        <OpcionCanal key={canal} canal={canal} marcado={usar(canal)} disponible={disponibles && disponibles[canal]} cambiar={marcado => setElegidos({...elegidos, [canal]: marcado})}/>
                                    ))}
                                </div>
                                <p className={"text-[12px] text-gray-500"}>Puedes elegir los dos. El PDF siempre se puede descargar al terminar.</p>
                            </section>

                            <section className={"flex flex-col gap-[12px]"}>
                                <h3 className={"text-[12px] font-semibold uppercase tracking-[.12em] text-gray-500 leading-none"}>Tus datos</h3>
                                <div className={"grid grid-cols-1 sm:grid-cols-2 gap-[12px]"}>
                                    <Campo etiqueta={"Nombre y apellido"}>
                                        <input ref={primerCampo} required minLength={2} maxLength={100} autoComplete={"name"} value={cliente.nombre} onChange={cambiar('nombre')} className={claseInput}/>
                                    </Campo>
                                    <Campo etiqueta={"Empresa"} opcional>
                                        <input maxLength={120} autoComplete={"organization"} value={cliente.empresa} onChange={cambiar('empresa')} className={claseInput}/>
                                    </Campo>
                                    {/* el correo y el whatsapp solo son obligatorios si se eligio ese medio */}
                                    <Campo etiqueta={"Correo electrónico"} opcional={!usar('correo')}>
                                        <input type={"email"} required={usar('correo')} maxLength={150} autoComplete={"email"} placeholder={"tucorreo@empresa.com"} value={cliente.correo} onChange={cambiar('correo')} className={claseInput}/>
                                    </Campo>
                                    <Campo etiqueta={"WhatsApp"} opcional={!usar('whatsapp')}>
                                        <input type={"tel"} required={usar('whatsapp')} inputMode={"tel"} pattern={"[0-9 +()\\-]{9,20}"} title={"Celular de 9 dígitos o número con código de país"} autoComplete={"tel"} placeholder={"987 654 321"} value={cliente.whatsapp} onChange={cambiar('whatsapp')} className={claseInput}/>
                                    </Campo>
                                    <Campo etiqueta={"RUC o DNI"} opcional>
                                        <input inputMode={"numeric"} pattern={"\\d{8}|\\d{11}"} title={"DNI de 8 dígitos o RUC de 11"} maxLength={11} value={cliente.documento} onChange={cambiar('documento')} className={claseInput}/>
                                    </Campo>
                                    <Campo etiqueta={"Comentario"} opcional className={"sm:col-span-2"}>
                                        <textarea rows={3} maxLength={500} placeholder={"Tallas, lugar de entrega, fecha que lo necesitas..."} value={cliente.mensaje} onChange={cambiar('mensaje')} className={`${claseInput} resize-none`}/>
                                    </Campo>
                                </div>
                            </section>
                        </div>

                        <div className={"border-t border-gray-200 px-[22px] py-[14px] flex flex-col gap-[10px]"}>
                            {error && <p role={"alert"} className={"rounded-[10px] bg-red-50 px-[12px] py-[8px] text-[13px] text-red-700"}>{error}</p>}
                            <div className={"flex flex-wrap items-center justify-end gap-[10px]"}>
                                <button type={"button"} onClick={cerrar} disabled={enviando} className={"rounded-[10px] px-[16px] py-[10px] text-[14px] font-semibold text-gray-600 hover:text-gray-900 cursor-pointer disabled:opacity-40"}>Cancelar</button>
                                <button type={"submit"} disabled={enviando} className={"flex items-center gap-[8px] rounded-[10px] bg-slate-900 px-[18px] py-[10px] text-[14px] font-semibold text-white hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-wait"}>
                                    {enviando && <Giro/>}
                                    {enviando ? 'Enviando...' : algunCanal ? 'Enviar cotización' : 'Generar cotización'}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

// se monta una vez en el layout; cada vez que se abre arranca con los productos recibidos
export const FormularioCotizacion = () => {
    const {abierto, productos, cerrar} = useControladorCotizacion();
    return abierto ? <Modal productosIniciales={productos} cerrar={cerrar}/> : null;
}
