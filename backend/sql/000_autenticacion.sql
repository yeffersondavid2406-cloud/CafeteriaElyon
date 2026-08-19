-- =====================================================
-- Cafetería Elyon - Migración de Autenticación y Roles
-- PostgreSQL / Supabase
--
-- Seguro de ejecutar: usa ALTER TABLE ... ADD COLUMN IF NOT EXISTS
-- No borra datos existentes de productos, pedidos ni detalles_pedidos.
-- =====================================================

-- -----------------------------------------------------
-- 1. TABLA usuarios: agregar columnas de autenticación
-- -----------------------------------------------------
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS nombre_usuario VARCHAR(100);

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS proveedor_auth VARCHAR(50) DEFAULT 'password';

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS provider_id TEXT;

-- contrasena deja de ser obligatoria (los usuarios de Google no la tienen;
-- la contraseña real se guarda en password_hash con bcrypt)
ALTER TABLE usuarios
  ALTER COLUMN contrasena DROP NOT NULL;

-- El rol por defecto pasa a ser 'cliente' (antes era 'empleado')
ALTER TABLE usuarios
  ALTER COLUMN rol SET DEFAULT 'cliente';

-- -----------------------------------------------------
-- 2. Restricciones de unicidad
--    (las tablas están vacías, es seguro)
-- -----------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_correo_key
  ON usuarios (correo);

CREATE UNIQUE INDEX IF NOT EXISTS usuarios_nombre_usuario_key
  ON usuarios (nombre_usuario)
  WHERE nombre_usuario IS NOT NULL;

-- -----------------------------------------------------
-- 3. pedidos: asociar cada pedido al usuario autenticado
--    Se conserva cliente_id (pedidos antiguos)
-- -----------------------------------------------------
ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS usuario_id BIGINT
  REFERENCES usuarios(id)
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS pedidos_usuario_id_idx
  ON pedidos (usuario_id);

-- -----------------------------------------------------
-- 4. El administrador NO se inserta aquí.
--    Ejecuta después:  pnpm crear-admin
--    (usa bcrypt para no guardar la contraseña en texto plano)
-- -----------------------------------------------------