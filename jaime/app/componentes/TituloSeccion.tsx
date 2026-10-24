// titulo de las secciones de la pagina principal: todas usan la misma separacion
// (40.5px con el bloque anterior y 30.5px con su contenido) para que el ritmo sea parejo.
// en celular la separacion es menor (24px / 16px) porque la pantalla es baja. Siempre empieza con mayuscula
export const TituloSeccion = ({children} : {children : string}) => (
    <div className={"pt-[24px] pb-[16px] sm:pt-[40.5px] sm:pb-[30.5px] flex gap-[15px] justify-center items-center"}>
        <span className={"block flex-1 max-w-[450px] h-[1px] bg-white"}/>
        <h2 className={"text-[24px] sm:text-[26px] md:text-[35px] text-center leading-none first-letter:uppercase"}>{children}</h2>
        <span className={"block flex-1 max-w-[450px] h-[1px] bg-white"}/>
    </div>
)
