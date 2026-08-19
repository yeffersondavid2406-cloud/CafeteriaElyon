import pool from "../src/config/database.js";
import bcrypt from "bcryptjs";

const NOMBRE = "Administrador";
const NOMBRE_USUARIO = "admin";
const CORREO = "admin@cafeteriaelyon.com";
const CONTRASENA = "240506250506";

async function main() {
  const passwordHash = await bcrypt.hash(CONTRASENA, 10);

  const result = await pool.query(
    `
    INSERT INTO usuarios (nombre, nombre_usuario, correo, password_hash, rol, proveedor_auth)
    VALUES ($1, $2, $3, $4, 'admin', 'password')
    ON CONFLICT (correo) DO UPDATE SET
      nombre_usuario = EXCLUDED.nombre_usuario,
      password_hash = EXCLUDED.password_hash,
      rol = 'admin',
      proveedor_auth = 'password'
    RETURNING id, nombre_usuario, correo, rol
    `,
    [NOMBRE, NOMBRE_USUARIO, CORREO, passwordHash]
  );

  const admin = result.rows[0];

  console.log("✅ Administrador listo:");
  console.log(`   Usuario: ${admin.nombre_usuario}`);
  console.log(`   Email:   ${admin.correo}`);
  console.log(`   Rol:     ${admin.rol}`);
  console.log("   Contraseña: (la que configuraste en este script)");
  console.log("   Inicia sesión en /login");

  await pool.end();
}

main().catch((error) => {
  console.error("❌ Error creando el administrador:", error.message);
  process.exit(1);
});