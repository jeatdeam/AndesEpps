-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL,
    "img" TEXT[],
    "descripcionPrimaria" TEXT NOT NULL,
    "descripcionSecundaria" TEXT[],
    "caracteristicas" TEXT[],
    "informacionAdicional" TEXT[],
    "categoria" TEXT NOT NULL,
    "marca" TEXT,
    "normas" TEXT[],
    "tallas" TEXT[],
    "colores" TEXT[],
    "material" TEXT,
    "descuento" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3),
    "calificacion" DOUBLE PRECISION,
    "resenas" INTEGER,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "posicion" TEXT NOT NULL,
    "imagen" TEXT NOT NULL,
    "titulo" TEXT NOT NULL DEFAULT '',
    "categoria" TEXT,
    "productoId" INTEGER,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("posicion")
);

-- CreateTable
CREATE TABLE "Cotizacion" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "archivo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cliente" JSONB NOT NULL,
    "items" JSONB NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "enviosCorreo" INTEGER NOT NULL DEFAULT 0,
    "enviosWhatsapp" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Cotizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Administrador" (
    "id" SERIAL NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "nombre" TEXT NOT NULL DEFAULT '',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Administrador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Producto_name_key" ON "Producto"("name");

-- CreateIndex
CREATE INDEX "Producto_categoria_idx" ON "Producto"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "Cotizacion_numero_key" ON "Cotizacion"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Cotizacion_archivo_key" ON "Cotizacion"("archivo");

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_correo_key" ON "Administrador"("correo");

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
