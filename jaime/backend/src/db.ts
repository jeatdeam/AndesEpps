import {PrismaClient} from '@prisma/client';

// un solo cliente para todo el backend (cada PrismaClient abre su propio grupo de conexiones)
export const prisma = new PrismaClient();
