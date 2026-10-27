import {GestorProductos} from '@/app/componentes/dashboard/GestorProductos';
import {GestorBanners} from '@/app/componentes/dashboard/GestorBanners';
import {SesionDashboard} from '@/app/componentes/dashboard/SesionDashboard';

export default function Page() {
    return (
        <main className={`w-full py-[32px]`}>
            <div className={"w-[92%] max-w-[1400px] mx-auto flex flex-col gap-[24px]"}>
                <div>
                    <span className={"text-[12px] font-semibold uppercase tracking-[0.15em] text-gray-500"}>Panel de administración</span>
                    <h1 className={"text-[28px] font-bold text-gray-900 leading-none"}>Dashboard</h1>
                </div>
                <SesionDashboard>
                    <GestorProductos/>
                    <GestorBanners/>
                </SesionDashboard>
            </div>
        </main>
    )
}
