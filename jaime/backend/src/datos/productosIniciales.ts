import type {Producto} from '../almacen';

// productos con los que se crea data/productos.json la primera vez que arranca el servidor
// (textos, marcas y reseñas de demostración)
export const productosIniciales : Producto[] = [
    {
        "id": 1,
        "name": "casco de seguridad",
        "precio": 150,
        "stock": 110,
        "img": [
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1752811244/cuack_camu_4_kqwlso.webp",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1752811230/cuack_camu_2_nmx790.webp",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1752811230/cuack_camu_3_exd229.webp",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1752415297/DeWatermark.ai_1752414337753-Photoroom_gxlax4.webp"
        ],
        "descripcionPrimaria": "Casco liviano de polietileno de alta densidad con suspensión de 4 puntos y ajuste tipo rachet, compatible con careta para soldar.",
        "descripcionSecundaria": [
            "Suspensión textil de 4 puntos",
            "Ajuste rachet de una mano",
            "Ranuras laterales para careta y orejeras",
            "Dieléctrico clase E hasta 20 000 V"
        ],
        "caracteristicas": [
            "Peso aproximado de 350 g",
            "Banda de sudor reemplazable",
            "Resiste chispas y salpicaduras de soldadura",
            "Vida útil recomendada de 5 años"
        ],
        "informacionAdicional": [
            "\"Cómodo para toda la jornada, no aprieta la cabeza.\" — Luis M., Arequipa",
            "\"Lo compramos para 40 soldadores y llegó a tiempo.\" — Metalmecánica Inka",
            "\"El rachet es muy práctico.\" — Rosa P., Lima"
        ],
        "categoria": "proteccion para soldador",
        "normas": [
            "ANSI Z89.1 Tipo I Clase E"
        ],
        "tallas": [
            "Única"
        ],
        "colores": [
            "Amarillo",
            "Blanco",
            "Azul"
        ],
        "descuento": 10,
        "marca": "3M",
        "material": "Polietileno de alta densidad",
        "calificacion": 4.7,
        "resenas": 128
    },
    {
        "id": 2,
        "name": "chompa de seguridad",
        "precio": 250,
        "stock": 220,
        "img": [
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1752414254/camu_camu-Photoroom_dm1ahl.webp",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1752414254/camu-transparente_poanwc.webp",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1750646066/plato_echado-Photoroom_xndrsi.webp",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1750643317/DeWatermark.ai_1750642722000-Photoroom_zenofw.webp"
        ],
        "descripcionPrimaria": "Chompa térmica de polar con cuello alto y cintas reflectivas, pensada para turnos de madrugada y zonas de altura.",
        "descripcionSecundaria": [
            "Polar antipilling de 300 g/m²",
            "Cintas reflectivas en pecho y espalda",
            "Cuello alto con cierre",
            "Puños elásticos"
        ],
        "caracteristicas": [
            "Abriga sin perder movilidad",
            "Se puede bordar el logo de la empresa",
            "Secado rápido",
            "Lavable a máquina"
        ],
        "informacionAdicional": [
            "\"En Puno a las 5 a. m. abriga de verdad.\" — Ronald Q., Juliaca",
            "\"Quedó muy bien con nuestro logo.\" — Minera Altiplano"
        ],
        "categoria": "proteccion facial",
        "marca": "Andes Pro",
        "normas": [
            "ANSI/ISEA 107"
        ],
        "tallas": [
            "S",
            "M",
            "L",
            "XL"
        ],
        "colores": [
            "Azul marino",
            "Gris"
        ],
        "material": "Polar de poliéster",
        "calificacion": 4.5,
        "resenas": 64
    },
    {
        "id": 3,
        "name": "pantalon de seguridad",
        "precio": 350,
        "stock": 330,
        "img": [
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1750643317/DeWatermark.ai_1750642722000-Photoroom_zenofw.webp",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1750642195/camu_camu-Photoroom_-_copia_yblpdv.webp",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1750642074/pote-invisible_kuuyuf.webp",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1750642048/gota_got_fino_njwj52.webp"
        ],
        "descripcionPrimaria": "Pantalón de drill reforzado con cintas reflectivas y rodilleras, para trabajos en altura y obra.",
        "descripcionSecundaria": [
            "Drill 100 % algodón de 8 oz",
            "Cintas reflectivas de 2\" en las piernas",
            "Rodilleras reforzadas",
            "6 bolsillos con cierre"
        ],
        "caracteristicas": [
            "Compatible con arnés de cuerpo completo",
            "Costura triple en tiro y entrepierna",
            "Pretina con pasadores anchos",
            "Lavado industrial"
        ],
        "informacionAdicional": [
            "\"Resiste bien el trabajo con arnés.\" — Montajes del Sur",
            "\"Las tallas son exactas.\" — Jhon P., Lima"
        ],
        "categoria": "proteccion de alturas",
        "marca": "Andes Pro",
        "normas": [
            "ANSI/ISEA 107"
        ],
        "tallas": [
            "28",
            "30",
            "32",
            "34",
            "36",
            "38"
        ],
        "colores": [
            "Azulino",
            "Caqui"
        ],
        "material": "Drill 100 % algodón",
        "calificacion": 4.4,
        "resenas": 52
    },
    {
        "id": 4,
        "name": "zapatos de seguridad",
        "precio": 450,
        "stock": 440,
        "img": [
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1750642022/cuackssito_fino_lqinny.webp",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1750642021/aguaje-invisible_l8kujq.webp",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1750642021/aguajina-invisible_oaj3qf.webpp",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1750556906/aguajina-sin-marca_kdx0oq.png"
        ],
        "descripcionPrimaria": "Zapatos de cuero con puntera de acero y planta antideslizante resistente a aceites, para planta, almacén y obra.",
        "descripcionSecundaria": [
            "Puntera de acero 200 J",
            "Planta de caucho antideslizante",
            "Resistentes a hidrocarburos",
            "Plantilla acolchada removible"
        ],
        "caracteristicas": [
            "Cuero flor engrasado",
            "Forro transpirable",
            "Costura reforzada",
            "Ojalillos metálicos antióxido"
        ],
        "informacionAdicional": [
            "\"Muy cómodos desde el primer día.\" — Alex C., Moquegua",
            "\"Ya van 8 meses en planta y siguen como nuevos.\" — Freddy Y., Callao"
        ],
        "categoria": "calzado de seguridad",
        "normas": [
            "ASTM F2413",
            "NTP ISO 20345"
        ],
        "tallas": [
            "38",
            "39",
            "40",
            "41",
            "42",
            "43",
            "44"
        ],
        "colores": [
            "Negro",
            "Marrón"
        ],
        "descuento": 20,
        "marca": "Caterpillar",
        "material": "Cuero flor",
        "calificacion": 4.7,
        "resenas": 156
    },
    {
        "id": 5,
        "name": "lentes de seguridad",
        "precio": 550,
        "stock": 550,
        "img": [
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1750556837/aguaje-liquido-sinMarca_ldcomu.jpg",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1750556829/aguaje-fruta-sin-fondo_wugtgb.jpg",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1750556829/aguaje-cuatro-frutas-sin-logo_hc4hfl.jpg",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1750382848/cuack_uisdlb.webp"
        ],
        "descripcionPrimaria": "Lentes de policarbonato con protección lateral y tratamiento antiempañante, para trabajos con riesgo de partículas.",
        "descripcionSecundaria": [
            "Luna de policarbonato resistente a impactos",
            "Protección UV 99.9 %",
            "Tratamiento antiempañante",
            "Muy livianos: 24 g"
        ],
        "caracteristicas": [
            "Recubrimiento antirayaduras",
            "Diseño envolvente",
            "Se pueden usar con respirador",
            "Incluye cordón de sujeción"
        ],
        "informacionAdicional": [
            "\"No se empañan con la mascarilla.\" — Diana L., Lima",
            "\"Buenos y económicos para todo el personal.\" — Ferretería El Maestro"
        ],
        "categoria": "proteccion de manos",
        "normas": [
            "ANSI Z87.1",
            "EN 166"
        ],
        "tallas": [
            "Única"
        ],
        "colores": [
            "Claro",
            "Gris",
            "Ámbar"
        ],
        "descuento": 25,
        "marca": "Uvex",
        "material": "Policarbonato",
        "calificacion": 4.6,
        "resenas": 210
    },
    {
        "id": 6,
        "name": "chalecos de seguridad",
        "precio": 650,
        "stock": 660,
        "img": [
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1745037637/visaTwo_yvy6v3.jpg",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1745037451/americanExpressTwo_ihb1dt.png",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1745037439/plinTwo_it8axc.png",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1745036133/yapethree_pprrrw.png"
        ],
        "descripcionPrimaria": "Chaleco de alta visibilidad con cintas reflectivas de 2 pulgadas y bolsillos, para obras, vías y almacenes.",
        "descripcionSecundaria": [
            "Cintas reflectivas de 2\"",
            "Tela fluorescente",
            "Cierre frontal",
            "4 bolsillos porta lapicero y radio"
        ],
        "caracteristicas": [
            "Visibilidad de día y de noche",
            "Se puede personalizar con logo",
            "Liviano y fresco",
            "Venta por docena disponible"
        ],
        "informacionAdicional": [
            "\"Pedimos 100 con nuestro logo y quedaron muy bien.\" — Transportes Rápido",
            "\"Buena tela.\" — Carmen V., Lima"
        ],
        "categoria": "proteccion corporal",
        "marca": "Andes Pro",
        "normas": [
            "ANSI/ISEA 107 Clase 2"
        ],
        "tallas": [
            "M",
            "L",
            "XL"
        ],
        "colores": [
            "Amarillo limón",
            "Naranja"
        ],
        "material": "Poliéster",
        "calificacion": 4.5,
        "resenas": 265
    },
    {
        "id": 7,
        "name": "mamelucos se seguridad",
        "precio": 750,
        "stock": 770,
        "img": [
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1745034321/mastercard_ksbmak.jpg",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1745037637/visaTwo_yvy6v3.jpg",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1745297417/codigoYape_c0wwou.png",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1745037451/americanExpressTwo_ihb1dt.png"
        ],
        "descripcionPrimaria": "Mameluco de drill con cintas reflectivas, cierre frontal y múltiples bolsillos, para mantenimiento y planta.",
        "descripcionSecundaria": [
            "Drill 100 % algodón",
            "Cintas reflectivas en brazos y piernas",
            "Cierre frontal reforzado",
            "6 bolsillos"
        ],
        "caracteristicas": [
            "Fresco y resistente",
            "Puños con elástico",
            "Se puede bordar el logo",
            "Lavado industrial"
        ],
        "informacionAdicional": [
            "\"Buena costura, no se descose.\" — Taller Mecánico Ramos",
            "\"Cómodo para todo el turno.\" — Minera Los Quenuales"
        ],
        "categoria": "proteccion auditiva",
        "marca": "Andes Pro",
        "normas": [
            "NTP 241.016"
        ],
        "tallas": [
            "S",
            "M",
            "L",
            "XL",
            "XXL"
        ],
        "colores": [
            "Azulino",
            "Naranja"
        ],
        "material": "Drill 100 % algodón",
        "calificacion": 4.6,
        "resenas": 83
    },
    {
        "id": 8,
        "name": "maquinas de seguridad",
        "precio": 850,
        "stock": 880,
        "img": [
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1744128099/agresivo-two_zh22jb.webp",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1744128098/agresivo-three_jbct5e.webp",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1744128098/agresivo-one_tselei.webpp",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1744128098/agresivo-four_xmobis.webp"
        ],
        "descripcionPrimaria": "Protector facial con visor de policarbonato abatible y rachet de ajuste, para esmerilado, corte y salpicaduras.",
        "descripcionSecundaria": [
            "Visor de policarbonato de 1 mm",
            "Abatible hacia arriba",
            "Rachet de ajuste",
            "Visor reemplazable"
        ],
        "caracteristicas": [
            "Se usa sobre lentes de seguridad",
            "Resistente a impactos",
            "Liviano",
            "Para talleres y laboratorios"
        ],
        "informacionAdicional": [
            "\"Indispensable para el esmeril.\" — Carpintería Metálica Lima",
            "\"El visor no se raya fácil.\" — Óscar F., Callao"
        ],
        "categoria": "proteccion visual",
        "normas": [
            "ANSI Z87.1"
        ],
        "tallas": [
            "Única"
        ],
        "colores": [
            "Claro"
        ],
        "descuento": 15,
        "marca": "Honeywell",
        "material": "Policarbonato",
        "calificacion": 4.4,
        "resenas": 37
    },
    {
        "id": 9,
        "name": "minas de seguridad",
        "precio": 950,
        "stock": 990,
        "img": [
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1743982937/anquilosaurio-three_ojwluy.webp",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1743982937/anquilosaurio-four_mmgzlg.webp",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1743982937/anquilosaurio-two_apwoil.webp",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1743982937/anquilosaurio-one_gpass7.webp"
        ],
        "descripcionPrimaria": "Casco para minería subterránea con portalámpara frontal y sujetacable posterior, con suspensión de 6 puntos.",
        "descripcionSecundaria": [
            "Portalámpara frontal reforzado",
            "Sujetacable posterior",
            "Suspensión de 6 puntos",
            "Barbiquejo incluido"
        ],
        "caracteristicas": [
            "Carcasa resistente a impactos y penetración",
            "Compatible con lámparas mineras estándar",
            "Tafilete acolchado",
            "Uso en socavón y tajo abierto"
        ],
        "informacionAdicional": [
            "\"Aguanta el trabajo diario en mina sin problemas.\" — Jorge T., Cerro de Pasco",
            "\"Buen ajuste con la lámpara.\" — Minera San Lucas"
        ],
        "categoria": "proteccion de cabeza",
        "normas": [
            "ANSI Z89.1 Tipo I Clase E"
        ],
        "tallas": [
            "Única"
        ],
        "colores": [
            "Blanco",
            "Amarillo"
        ],
        "descuento": 30,
        "marca": "MSA",
        "material": "Polietileno",
        "calificacion": 4.8,
        "resenas": 74
    },
    {
        "id": 10,
        "name": "chaleco antibalas",
        "precio": 1050,
        "stock": 1010,
        "img": [
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1743991324/carnotauro-two_avsert.webp",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1743991323/carnotauro-three_tdrfel.webp",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1743991321/carnotauro-one_njmu1o.webp",
            "https://res.cloudinary.com/dfwtyxxba/image/upload/v1743991321/carnotauro-four_vvef0n.webp"
        ],
        "descripcionPrimaria": "Chaleco de protección balística nivel IIIA con paneles de aramida, para personal de seguridad y vigilancia.",
        "descripcionSecundaria": [
            "Nivel de protección IIIA",
            "Paneles de aramida removibles",
            "Ajuste lateral con velcro",
            "Funda lavable"
        ],
        "caracteristicas": [
            "Peso aproximado de 2.8 kg",
            "Uso interno o externo",
            "Bolsillos porta placa",
            "Garantía de los paneles por 5 años"
        ],
        "informacionAdicional": [
            "\"Liviano para todo el turno.\" — Seguridad Integral SAC",
            "\"Muy buen acabado.\" — Vigilancia Andina"
        ],
        "categoria": "sistema de bloqueo",
        "marca": "DuPont",
        "normas": [
            "NIJ 0101.06"
        ],
        "tallas": [
            "M",
            "L",
            "XL"
        ],
        "colores": [
            "Negro",
            "Azul noche"
        ],
        "material": "Aramida y cordura",
        "calificacion": 4.9,
        "resenas": 18
    }
];
