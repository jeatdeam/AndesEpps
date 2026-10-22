// logos en public/pagos (Wikimedia Commons). Plin no tiene logo libre: se muestra su nombre
// hasta colocar el archivo oficial en public/pagos/plin.svg y agregarle "imagen"
const MEDIOS_PAGO : {nombre : string, imagen? : string, cubrir? : boolean}[] = [
    {nombre: 'Yape', imagen: '/pagos/yape.svg', cubrir: true},
    {nombre: 'Plin'},
    {nombre: 'Visa', imagen: '/pagos/visa.svg'},
    {nombre: 'Mastercard', imagen: '/pagos/mastercard.svg'},
    {nombre: 'American Express', imagen: '/pagos/amex.svg'},
    {nombre: 'Diners Club', imagen: '/pagos/diners.svg'},
];

export const MediosPago = () => (
    <div className={"flex flex-col items-start gap-[10px]"}>
        <span className={"text-[15px] font-semibold"}>Medios de pago</span>
        <ul className={"flex flex-wrap gap-[8px]"}>
            {MEDIOS_PAGO.map(({nombre, imagen, cubrir}) => (
                <li key={nombre} title={nombre} className={`w-[64px] h-[40px] rounded-[8px] bg-white ring-1 ring-black/10 overflow-hidden flex items-center justify-center ${cubrir ? "" : "p-[6px]"}`}>
                    {imagen
                        ? <img src={imagen} alt={nombre} className={`w-full h-full ${cubrir ? "object-cover" : "object-contain"}`}/>
                        : <span className={"text-[15px] font-extrabold tracking-tight text-[#00A6B4]"}>{nombre}</span>}
                </li>
            ))}
        </ul>
    </div>
)
