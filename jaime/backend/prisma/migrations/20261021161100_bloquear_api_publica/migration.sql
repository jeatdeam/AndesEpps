-- supabase publica una API REST para cada tabla del esquema public (roles anon y authenticated).
-- la tienda solo entra a la base de datos desde el backend con prisma, asi que esa API queda cerrada:
-- RLS activado sin politicas = los roles publicos no ven ni modifican ninguna fila.
-- prisma se conecta como el dueño de las tablas, que no esta sujeto a RLS, y sigue funcionando igual.
ALTER TABLE "Producto" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Banner" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Cotizacion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Administrador" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
-- las tablas que se creen en el futuro tampoco quedan expuestas
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
