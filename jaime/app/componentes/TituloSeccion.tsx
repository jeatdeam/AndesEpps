// titulo de las secciones de la pagina principal: todas usan la misma separacion
// (28px con el bloque anterior y 18px con su contenido) para que el ritmo sea parejo
export const TituloSeccion = ({children} : {children : string}) => (
    <div className={"pt-[28px] pb-[18px] flex gap-[15px] justify-center items-center"}>
        <span className={"block flex-1 max-w-[450px] h-[1px] bg-white"}/>
        <h2 className={"text-[26px] md:text-[35px] text-center leading-none"}>{children}</h2>
        <span className={"block flex-1 max-w-[450px] h-[1px] bg-white"}/>
    </div>
)
