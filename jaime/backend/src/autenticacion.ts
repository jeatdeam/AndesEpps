import type {Request, Response, NextFunction, CookieOptions} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {prisma} from './db';

// el dashboard entra con correo y contraseña; la sesion es un jwt firmado dentro de una cookie httpOnly
const COOKIE = 'sesion_admin';
const DURACION_MS = 7 * 24 * 60 * 60 * 1000;

// demasiados intentos fallidos desde una misma ip bloquean el login un rato
const MAX_INTENTOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000;
const intentos = new Map<string, {fallos : number, desde : number}>();

type Sesion = {id : number, correo : string};

// hash de relleno para comparar cuando el correo no existe (tarda lo mismo que uno real)
const HASH_FALSO = bcrypt.hashSync('sin-cuenta', 12);

const secreto = () => {
    const valor = process.env.JWT_SECRETO;
    if (!valor || valor.length < 32) throw new Error('Falta JWT_SECRETO en backend/.env (mínimo 32 caracteres)');
    return valor;
}

// en produccion con frontend y backend en dominios distintos: COOKIE_SAMESITE=none (exige https)
const opcionesCookie = () : CookieOptions => {
    const sameSite = process.env.COOKIE_SAMESITE === 'none' ? 'none' : 'lax';
    return {
        httpOnly : true,
        sameSite,
        secure : sameSite === 'none' || process.env.NODE_ENV === 'production',
        path : '/',
    };
}

const leerCookie = (req : Request) => {
    const cabecera = req.headers.cookie ?? '';
    for (const parte of cabecera.split(';')) {
        const [nombre, ...valor] = parte.trim().split('=');
        if (nombre === COOKIE) return decodeURIComponent(valor.join('='));
    }
    return undefined;
}

// devuelve el administrador de la cookie si el token es valido y la cuenta sigue existiendo
const sesionActual = async (req : Request) => {
    const token = leerCookie(req);
    if (!token) return null;
    try {
        const {id} = jwt.verify(token, secreto()) as Sesion;
        return await prisma.administrador.findUnique({where: {id}, select: {id: true, correo: true, nombre: true}});
    } catch {
        return null;
    }
}

export const soloAdministrador = async (req : Request, res : Response, next : NextFunction) => {
    if (!(await sesionActual(req))) return res.status(401).json({error: 'Inicia sesión para continuar.'});
    next();
}

// POST /auth/login {correo, contrasena}
const iniciarSesion = async (req : Request, res : Response) => {
    const ip = req.ip ?? 'desconocida';
    const registro = intentos.get(ip);
    if (registro && Date.now() - registro.desde > BLOQUEO_MS) intentos.delete(ip);
    if ((intentos.get(ip)?.fallos ?? 0) >= MAX_INTENTOS) return res.status(429).json({error: 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.'});

    const correo = typeof req.body?.correo === 'string' ? req.body.correo.trim().toLowerCase() : '';
    const contrasena = typeof req.body?.contrasena === 'string' ? req.body.contrasena : '';
    const administrador = correo ? await prisma.administrador.findUnique({where: {correo}}) : null;
    // se compara igual aunque el correo no exista, para no revelar cuales estan registrados
    const valida = await bcrypt.compare(contrasena, administrador?.contrasena ?? HASH_FALSO);
    if (!administrador || !valida) {
        const actual = intentos.get(ip);
        intentos.set(ip, {fallos: (actual?.fallos ?? 0) + 1, desde: actual?.desde ?? Date.now()});
        return res.status(401).json({error: 'Correo o contraseña incorrectos.'});
    }

    intentos.delete(ip);
    const token = jwt.sign({id: administrador.id, correo: administrador.correo} satisfies Sesion, secreto(), {expiresIn: DURACION_MS / 1000});
    res.cookie(COOKIE, token, {...opcionesCookie(), maxAge: DURACION_MS});
    res.json({correo: administrador.correo, nombre: administrador.nombre});
}

// POST /auth/logout
const cerrarSesion = (_req : Request, res : Response) => {
    res.clearCookie(COOKIE, opcionesCookie());
    res.status(204).end();
}

// GET /auth/sesion: el dashboard lo consulta para saber si mostrar el panel o el login
const verSesion = async (req : Request, res : Response) => {
    const administrador = await sesionActual(req);
    if (!administrador) return res.status(401).json({error: 'Sin sesión'});
    res.json({correo: administrador.correo, nombre: administrador.nombre});
}

export const hashContrasena = (contrasena : string) => bcrypt.hash(contrasena, 12);

export default {iniciarSesion, cerrarSesion, verSesion};
