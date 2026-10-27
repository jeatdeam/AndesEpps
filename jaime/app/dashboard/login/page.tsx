'use client'
import axios from 'axios';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {API} from '@/app/configuracion';
import {clienteAdmin} from '@/app/componentes/dashboard/clienteAdmin';

const claseInput = "w-full rounded-[10px] border border-gray-300 bg-white px-[12px] py-[10px] text-[14px] outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10";

export default function Page() {

    const router = useRouter();
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [entrando, setEntrando] = useState(false);
    const [error, setError] = useState('');

    const entrar = async (e : React.FormEvent) => {
        e.preventDefault();
        setEntrando(true);
        setError('');
        try {
            await clienteAdmin.post(`${API}/auth/login`, {correo, contrasena});
            router.replace('/dashboard');
        } catch (err) {
            setError(axios.isAxiosError(err) && err.response?.data?.error ? err.response.data.error : 'No se pudo conectar con el servidor.');
            setEntrando(false);
        }
    }

    return (
        <main className={`w-full min-h-[70vh] flex items-center justify-center px-[16px] py-[48px]`}>
            <form onSubmit={entrar} className={"w-full max-w-[380px] flex flex-col gap-[16px] rounded-[16px] border border-gray-200 bg-white p-[24px] shadow-[0px_10px_30px_rgba(0,0,0,.06)]"}>
                <div>
                    <span className={"text-[12px] font-semibold uppercase tracking-[0.15em] text-gray-500"}>Panel de administración</span>
                    <h1 className={"text-[24px] font-bold text-gray-900 leading-tight"}>Iniciar sesión</h1>
                </div>
                <label className={"flex flex-col gap-[5px]"}>
                    <span className={"text-[13px] font-medium text-gray-700"}>Correo</span>
                    <input type={"email"} required autoFocus autoComplete={"username"} value={correo} onChange={e => setCorreo(e.target.value)} className={claseInput}/>
                </label>
                <label className={"flex flex-col gap-[5px]"}>
                    <span className={"text-[13px] font-medium text-gray-700"}>Contraseña</span>
                    <input type={"password"} required autoComplete={"current-password"} value={contrasena} onChange={e => setContrasena(e.target.value)} className={claseInput}/>
                </label>
                {error && <p role={"alert"} className={"rounded-[10px] bg-red-50 px-[12px] py-[8px] text-[13px] text-red-700"}>{error}</p>}
                <button type={"submit"} disabled={entrando} className={"rounded-[10px] bg-slate-900 px-[18px] py-[11px] text-[14px] font-semibold text-white hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-wait"}>
                    {entrando ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
        </main>
    )
}
