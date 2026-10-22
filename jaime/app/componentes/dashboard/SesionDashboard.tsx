'use client'
import {useState, useEffect, type ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import {API} from '@/app/configuracion';
import {Cargando} from '@/app/componentes/Cargando';
import {clienteAdmin} from './clienteAdmin';

type Administrador = {correo : string, nombre : string};

// muestra el panel solo con una sesion valida; sin sesion lleva al login.
// la proteccion real esta en el backend: sin cookie no acepta cambios aunque alguien vea esta pagina
export const SesionDashboard = ({children} : {children : ReactNode}) => {

    const router = useRouter();
    const [administrador, setAdministrador] = useState<Administrador | null>(null);
    const [errorConexion, setErrorConexion] = useState(false);
    const [saliendo, setSaliendo] = useState(false);

    useEffect(() => {
        clienteAdmin.get<Administrador>(`${API}/auth/sesion`)
            .then(({data}) => setAdministrador(data))
            // el 401 ya lo redirige clienteAdmin; cualquier otro error es que el backend no responde
            .catch(error => { if (error?.response?.status !== 401) setErrorConexion(true); });
    }, []);

    const salir = async () => {
        setSaliendo(true);
        try { await clienteAdmin.post(`${API}/auth/logout`); } catch {}
        router.replace('/dashboard/login');
    }

    if (errorConexion) return <p className={"text-center text-[14px] text-gray-500 py-[40px]"}>No se pudo conectar con el servidor. Revisa que el backend esté encendido en {API}.</p>;
    if (!administrador) return <Cargando texto={"Verificando sesión..."}/>;

    return (
        <>
            <div className={"flex flex-wrap items-center justify-end gap-[12px] text-[13px] text-gray-600"}>
                <span>Sesión: <span className={"font-semibold text-gray-900"}>{administrador.nombre || administrador.correo}</span></span>
                <button type={"button"} onClick={salir} disabled={saliendo} className={"rounded-[10px] border-2 border-gray-300 px-[14px] py-[6px] font-semibold hover:border-slate-900 transition-colors cursor-pointer disabled:opacity-60"}>
                    {saliendo ? 'Saliendo...' : 'Cerrar sesión'}
                </button>
            </div>
            {children}
        </>
    )
}
