import type {Request, Response} from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// console.log(prisma);







const cat: string[] = [
    "sistemas de bloqueo",
    "proteccion de cabeza",
    "proteccion visual",
    "proteccion auditiva",
    "proteccion corporal",
    "proteccion de manos",
    "calzados de seguridad",
    "proteccion facial",
    "proteccion para soldador",
    "proteccion respiratoria",
    "proteccion de alturas",
    "reflecivos señalizacion"
];


const products = [
    {
        id : 1,
        name : 'casco de seguridad',
        precio: 150,
        stock : 110,
        img : ["https://res.cloudinary.com/dfwtyxxba/image/upload/v1752811244/cuack_camu_4_kqwlso.webp","https://res.cloudinary.com/dfwtyxxba/image/upload/v1752811230/cuack_camu_2_nmx790.webp","https://res.cloudinary.com/dfwtyxxba/image/upload/v1752811230/cuack_camu_3_exd229.webp","https://res.cloudinary.com/dfwtyxxba/image/upload/v1752415297/DeWatermark.ai_1752414337753-Photoroom_gxlax4.webp"],
        descripcionPrimaria : "lorem ipsum dolor sit amet consetetur lorem ipsum dolor sit amet consetetur",
        descripcionSecundaria : ["lorem ipsum dolor sit amet consetetur 1 1 1 ","lorem ipsum dolor sit amet consetetur 2 2 2","lorem ipsum dolor sit amet consetetur 3 3 3","lorem ipsum dolor sit amet consetetur 4 4 4"],
        caracteristicas : ["aqui esta la descripcion uno","aqui esta la decripcion dos","aqui esta la descripcion 3","aqui esta la descripcion 4"],
        informacionAdicional : ["color del objeto","marca del objeto","material del objeto","tipo de producto"],
        categoria : "proteccion para soldador",
    },
    {
        id : 2,
        name : 'chompa de seguridad',
        precio: 250,
        stock : 220,
        img : ["https://res.cloudinary.com/dfwtyxxba/image/upload/v1752414254/camu_camu-Photoroom_dm1ahl.webp","https://res.cloudinary.com/dfwtyxxba/image/upload/v1752414254/camu-transparente_poanwc.webp","https://res.cloudinary.com/dfwtyxxba/image/upload/v1750646066/plato_echado-Photoroom_xndrsi.webp","https://res.cloudinary.com/dfwtyxxba/image/upload/v1750643317/DeWatermark.ai_1750642722000-Photoroom_zenofw.webp"],
        descripcionPrimaria : "lorem ipsum dolor sit amet consetetur lorem ipsum dolor sit amet consetetur",
        descripcionSecundaria : ["lorem ipsum dolor sit amet consetetur 1 1 1 ","lorem ipsum dolor sit amet consetetur 2 2 2","lorem ipsum dolor sit amet consetetur 3 3 3","lorem ipsum dolor sit amet consetetur 4 4 4"],
        caracteristicas : ["aqui esta la descripcion uno","aqui esta la decripcion dos","aqui esta la descripcion 3","aqui esta la descripcion 4"],
        informacionAdicional : ["color del objeto","marca del objeto","material del objeto","tipo de producto"],
        categoria : "proteccion facial",
    },
    {
        id : 3,
        name : 'pantalon de seguridad',
        precio: 350,
        stock : 330,
        img : ["https://res.cloudinary.com/dfwtyxxba/image/upload/v1750643317/DeWatermark.ai_1750642722000-Photoroom_zenofw.webp","https://res.cloudinary.com/dfwtyxxba/image/upload/v1750642195/camu_camu-Photoroom_-_copia_yblpdv.webp","https://res.cloudinary.com/dfwtyxxba/image/upload/v1750642074/pote-invisible_kuuyuf.webp","https://res.cloudinary.com/dfwtyxxba/image/upload/v1750642048/gota_got_fino_njwj52.webp"],
        descripcionPrimaria : "lorem ipsum dolor sit amet consetetur lorem ipsum dolor sit amet consetetur",
        descripcionSecundaria : ["lorem ipsum dolor sit amet consetetur 1 1 1 ","lorem ipsum dolor sit amet consetetur 2 2 2","lorem ipsum dolor sit amet consetetur 3 3 3","lorem ipsum dolor sit amet consetetur 4 4 4"],
        caracteristicas : ["aqui esta la descripcion uno","aqui esta la decripcion dos","aqui esta la descripcion 3","aqui esta la descripcion 4"],
        informacionAdicional : ["color del objeto","marca del objeto","material del objeto","tipo de producto"],
        categoria : "proteccion de alturas",
    },
    {
        id : 4,
        name : 'zapatos de seguridad',
        precio: 450,
        stock : 440,
        img : ["https://res.cloudinary.com/dfwtyxxba/image/upload/v1750642022/cuackssito_fino_lqinny.webp","https://res.cloudinary.com/dfwtyxxba/image/upload/v1750642021/aguaje-invisible_l8kujq.webp","https://res.cloudinary.com/dfwtyxxba/image/upload/v1750642021/aguajina-invisible_oaj3qf.webpp","https://res.cloudinary.com/dfwtyxxba/image/upload/v1750556906/aguajina-sin-marca_kdx0oq.png"],
        descripcionPrimaria : "lorem ipsum dolor sit amet consetetur lorem ipsum dolor sit amet consetetur",
        descripcionSecundaria : ["lorem ipsum dolor sit amet consetetur 1 1 1 ","lorem ipsum dolor sit amet consetetur 2 2 2","lorem ipsum dolor sit amet consetetur 3 3 3","lorem ipsum dolor sit amet consetetur 4 4 4"],
        caracteristicas : ["aqui esta la descripcion uno","aqui esta la decripcion dos","aqui esta la descripcion 3","aqui esta la descripcion 4"],
        informacionAdicional : ["color del objeto","marca del objeto","material del objeto","tipo de producto"],
        categoria : "calzado de seguridad",
    },
    {
        id : 5,
        name : 'lentes de seguridad',
        precio: 550,
        stock : 550,
        img : ["https://res.cloudinary.com/dfwtyxxba/image/upload/v1750556837/aguaje-liquido-sinMarca_ldcomu.jpg","https://res.cloudinary.com/dfwtyxxba/image/upload/v1750556829/aguaje-fruta-sin-fondo_wugtgb.jpg","https://res.cloudinary.com/dfwtyxxba/image/upload/v1750556829/aguaje-cuatro-frutas-sin-logo_hc4hfl.jpg","https://res.cloudinary.com/dfwtyxxba/image/upload/v1750382848/cuack_uisdlb.webp"],
        descripcionPrimaria : "lorem ipsum dolor sit amet consetetur lorem ipsum dolor sit amet consetetur",
        descripcionSecundaria : ["lorem ipsum dolor sit amet consetetur 1 1 1 ","lorem ipsum dolor sit amet consetetur 2 2 2","lorem ipsum dolor sit amet consetetur 3 3 3","lorem ipsum dolor sit amet consetetur 4 4 4"],
        caracteristicas : ["aqui esta la descripcion uno","aqui esta la decripcion dos","aqui esta la descripcion 3","aqui esta la descripcion 4"],
        informacionAdicional : ["color del objeto","marca del objeto","material del objeto","tipo de producto"],
        categoria : "proteccion de manos",
    },
    {
        id : 6,
        name : 'chalecos de seguridad',
        precio: 650,
        stock : 660,
        img : ["https://res.cloudinary.com/dfwtyxxba/image/upload/v1745037637/visaTwo_yvy6v3.jpg","https://res.cloudinary.com/dfwtyxxba/image/upload/v1745037451/americanExpressTwo_ihb1dt.png","https://res.cloudinary.com/dfwtyxxba/image/upload/v1745037439/plinTwo_it8axc.png","https://res.cloudinary.com/dfwtyxxba/image/upload/v1745036133/yapethree_pprrrw.png"],
        descripcionPrimaria : "lorem ipsum dolor sit amet consetetur lorem ipsum dolor sit amet consetetur",
        descripcionSecundaria : ["lorem ipsum dolor sit amet consetetur 1 1 1 ","lorem ipsum dolor sit amet consetetur 2 2 2","lorem ipsum dolor sit amet consetetur 3 3 3","lorem ipsum dolor sit amet consetetur 4 4 4"],
        caracteristicas : ["aqui esta la descripcion uno","aqui esta la decripcion dos","aqui esta la descripcion 3","aqui esta la descripcion 4"],
        informacionAdicional : ["color del objeto","marca del objeto","material del objeto","tipo de producto"],
        categoria : "proteccion corporal",
    },
    {
        id : 7,
        name : 'mamelucos se seguridad',
        precio: 750,
        stock : 770,
        img : ["https://res.cloudinary.com/dfwtyxxba/image/upload/v1745034321/mastercard_ksbmak.jpg","https://res.cloudinary.com/dfwtyxxba/image/upload/v1745037637/visaTwo_yvy6v3.jpg","https://res.cloudinary.com/dfwtyxxba/image/upload/v1745297417/codigoYape_c0wwou.png","https://res.cloudinary.com/dfwtyxxba/image/upload/v1745037451/americanExpressTwo_ihb1dt.png"],
        descripcionPrimaria : "lorem ipsum dolor sit amet consetetur lorem ipsum dolor sit amet consetetur",
        descripcionSecundaria : ["lorem ipsum dolor sit amet consetetur 1 1 1 ","lorem ipsum dolor sit amet consetetur 2 2 2","lorem ipsum dolor sit amet consetetur 3 3 3","lorem ipsum dolor sit amet consetetur 4 4 4"],
        caracteristicas : ["aqui esta la descripcion uno","aqui esta la decripcion dos","aqui esta la descripcion 3","aqui esta la descripcion 4"],
        informacionAdicional : ["color del objeto","marca del objeto","material del objeto","tipo de producto"],
        categoria : "proteccion auditiva",
    },    {
        id : 8,
        name : 'maquinas de seguridad',
        precio: 850,
        stock : 880,
        img : ["https://res.cloudinary.com/dfwtyxxba/image/upload/v1744128099/agresivo-two_zh22jb.webp","https://res.cloudinary.com/dfwtyxxba/image/upload/v1744128098/agresivo-three_jbct5e.webp","https://res.cloudinary.com/dfwtyxxba/image/upload/v1744128098/agresivo-one_tselei.webpp","https://res.cloudinary.com/dfwtyxxba/image/upload/v1744128098/agresivo-four_xmobis.webp"],
        descripcionPrimaria : "lorem ipsum dolor sit amet consetetur lorem ipsum dolor sit amet consetetur",
        descripcionSecundaria : ["lorem ipsum dolor sit amet consetetur 1 1 1 ","lorem ipsum dolor sit amet consetetur 2 2 2","lorem ipsum dolor sit amet consetetur 3 3 3","lorem ipsum dolor sit amet consetetur 4 4 4"],
        caracteristicas : ["aqui esta la descripcion uno","aqui esta la decripcion dos","aqui esta la descripcion 3","aqui esta la descripcion 4"],
        informacionAdicional : ["color del objeto","marca del objeto","material del objeto","tipo de producto"],
        categoria : "proteccion visual",
    },
    {
        id : 9,
        name : 'minas de seguridad',
        precio: 950,
        stock : 990,
        img : ["https://res.cloudinary.com/dfwtyxxba/image/upload/v1743982937/anquilosaurio-three_ojwluy.webp","https://res.cloudinary.com/dfwtyxxba/image/upload/v1743982937/anquilosaurio-four_mmgzlg.webp","https://res.cloudinary.com/dfwtyxxba/image/upload/v1743982937/anquilosaurio-two_apwoil.webp","https://res.cloudinary.com/dfwtyxxba/image/upload/v1743982937/anquilosaurio-one_gpass7.webp"],
        descripcionPrimaria : "lorem ipsum dolor sit amet consetetur lorem ipsum dolor sit amet consetetur",
        descripcionSecundaria : ["lorem ipsum dolor sit amet consetetur 1 1 1 ","lorem ipsum dolor sit amet consetetur 2 2 2","lorem ipsum dolor sit amet consetetur 3 3 3","lorem ipsum dolor sit amet consetetur 4 4 4"],
        caracteristicas : ["aqui esta la descripcion uno","aqui esta la decripcion dos","aqui esta la descripcion 3","aqui esta la descripcion 4"],
        informacionAdicional : ["color del objeto","marca del objeto","material del objeto","tipo de producto"],
        categoria : "proteccion de cabeza",
    },
    {
        id : 10,
        name : 'chaleco antibalas',
        precio: 1050,
        stock : 1010,
        img : ["https://res.cloudinary.com/dfwtyxxba/image/upload/v1743991324/carnotauro-two_avsert.webp","https://res.cloudinary.com/dfwtyxxba/image/upload/v1743991323/carnotauro-three_tdrfel.webp","https://res.cloudinary.com/dfwtyxxba/image/upload/v1743991321/carnotauro-one_njmu1o.webp","https://res.cloudinary.com/dfwtyxxba/image/upload/v1743991321/carnotauro-four_vvef0n.webp"],
        descripcionPrimaria : "lorem ipsum dolor sit amet consetetur lorem ipsum dolor sit amet consetetur",
        descripcionSecundaria : ["lorem ipsum dolor sit amet consetetur 1 1 1 ","lorem ipsum dolor sit amet consetetur 2 2 2","lorem ipsum dolor sit amet consetetur 3 3 3","lorem ipsum dolor sit amet consetetur 4 4 4"],
        caracteristicas : ["aqui esta la descripcion uno","aqui esta la decripcion dos","aqui esta la descripcion 3","aqui esta la descripcion 4"],
        informacionAdicional : ["color del objeto","marca del objeto","material del objeto","tipo de producto"],
        categoria : "sistema de bloqueo",
    }
]






const categorias = (req: Request, res: Response) => {

    res.json(cat)
}

const getProductosCategoria = (req: Request, res: Response) => {

    res.json(products)
}

const getProductElegido = (req: Request, res: Response) => {
    const { id} = req.params
    console.log(id)

    res.json({ elegido: 'tas yendo bien chamito'})

}


export default {
    categorias,
    getProductosCategoria,
    getProductElegido,
}