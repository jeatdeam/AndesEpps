// crea un usuario del dashboard o le cambia la contraseña si el correo ya existe
// uso: npx ts-node src/scripts/crearAdministrador.ts correo@ejemplo.com "contraseña" "Nombre"
import 'dotenv/config';
import {prisma} from '../db';
import {hashContrasena} from '../autenticacion';

const main = async () => {
    const [correoIngresado, contrasena, nombre = ''] = process.argv.slice(2);
    const correo = correoIngresado?.trim().toLowerCase();
    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || !contrasena) {
        console.error('Uso: npx ts-node src/scripts/crearAdministrador.ts correo@ejemplo.com "contraseña" "Nombre"');
        process.exitCode = 1;
        return;
    }
    if (contrasena.length < 10) {
        console.error('La contraseña debe tener al menos 10 caracteres.');
        process.exitCode = 1;
        return;
    }
    const hash = await hashContrasena(contrasena);
    const existe = await prisma.administrador.findUnique({where: {correo}});
    await prisma.administrador.upsert({
        where : {correo},
        create : {correo, contrasena: hash, nombre},
        update : {contrasena: hash, ...(nombre ? {nombre} : {})},
    });
    console.log(existe ? `Contraseña actualizada para ${correo}.` : `Administrador ${correo} creado.`);
}

main()
    .catch(error => { console.error('No se pudo guardar el administrador:', error); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
