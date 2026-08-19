import pool from "../config/database.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";

function publicUser(row) {
  return {
    id: Number(row.id),
    nombre: row.nombre,
    nombre_usuario: row.nombre_usuario,
    email: row.correo,
    rol: row.rol,
    proveedor_auth: row.proveedor_auth || "password",
    fecha_creacion: row.fecha_creacion || row.created_at || null,
  };
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// =====================================================
// REGISTRO DE CLIENTE
// POST /api/auth/register
// =====================================================

export async function register(req, res) {
  try {
    const { nombre, nombre_usuario, email, password } = req.body;

    if (!nombre || !nombre_usuario || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nombre, nombre de usuario, email y contraseña son obligatorios",
      });
    }

    const emailNorm = String(email).toLowerCase().trim();
    const usuarioNorm = String(nombre_usuario).trim();

    if (!validarEmail(emailNorm)) {
      return res.status(400).json({
        success: false,
        message: "El email no es válido",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    if (usuarioNorm.length < 3) {
      return res.status(400).json({
        success: false,
        message: "El nombre de usuario debe tener al menos 3 caracteres",
      });
    }

    // Validar que no exista email ni nombre de usuario repetidos
    const existente = await pool.query(
      `SELECT id FROM usuarios
       WHERE lower(correo) = $1 OR lower(nombre_usuario) = $2`,
      [emailNorm, usuarioNorm.toLowerCase()]
    );

    if (existente.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "El email o el nombre de usuario ya está registrado",
      });
    }

    const passwordHash = await hashPassword(String(password));

    const result = await pool.query(
      `INSERT INTO usuarios
         (nombre, nombre_usuario, correo, password_hash, rol, proveedor_auth)
       VALUES ($1, $2, $3, $4, 'cliente', 'password')
       RETURNING ${"id, nombre, nombre_usuario, correo, rol, proveedor_auth, created_at"}`,
      [String(nombre).trim(), usuarioNorm, emailNorm, passwordHash]
    );

    const user = publicUser(result.rows[0]);
    const token = generateToken({ id: user.id, rol: user.rol });

    return res.status(201).json({
      success: true,
      message: "Registro exitoso. Bienvenido a Cafetería Elyon ☕",
      token,
      user,
    });
  } catch (error) {
    console.error("❌ Error registrando usuario:", error);
    return res.status(500).json({
      success: false,
      message: "Error registrando el usuario",
    });
  }
}

// =====================================================
// LOGIN (email o nombre de usuario + contraseña)
// POST /api/auth/login
// =====================================================

export async function login(req, res) {
  try {
    const { identificador, email, usuario, password } = req.body;

    const ident = String(identificador || email || usuario || "").trim();

    if (!ident || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/nombre de usuario y contraseña son obligatorios",
      });
    }

    const result = await pool.query(
      `SELECT *, created_at FROM usuarios
       WHERE lower(correo) = lower($1) OR lower(nombre_usuario) = lower($1)`,
      [ident]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    const row = result.rows[0];

    const valida = await comparePassword(
      String(password),
      row.password_hash || ""
    );

    if (!valida) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    const user = publicUser(row);
    const token = generateToken({ id: user.id, rol: user.rol });

    return res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      token,
      user,
    });
  } catch (error) {
    console.error("❌ Error iniciando sesión:", error);
    return res.status(500).json({
      success: false,
      message: "Error iniciando sesión",
    });
  }
}

// =====================================================
// LOGOUT (JWT stateless: el frontend elimina el token)
// POST /api/auth/logout
// =====================================================

export async function logout(req, res) {
  return res.json({
    success: true,
    message: "Sesión cerrada correctamente",
  });
}

// =====================================================
// USUARIO ACTUAL
// GET /api/auth/me
// =====================================================

export async function me(req, res) {
  return res.json({
    success: true,
    user: publicUser(req.user),
  });
}

// =====================================================
// ACTUALIZAR PERFIL (nombre_usuario obligatorio para pedir)
// PATCH /api/auth/me
// =====================================================

export async function actualizarPerfil(req, res) {
  try {
    const { nombre, nombre_usuario } = req.body;

    if (nombre_usuario !== undefined && nombre_usuario !== null) {
      const usuarioNorm = String(nombre_usuario).trim();

      if (usuarioNorm.length < 3) {
        return res.status(400).json({
          success: false,
          message: "El nombre de usuario debe tener al menos 3 caracteres",
        });
      }

      const repetido = await pool.query(
        `SELECT id FROM usuarios
         WHERE lower(nombre_usuario) = lower($1) AND id <> $2`,
        [usuarioNorm, req.user.id]
      );

      if (repetido.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Ese nombre de usuario ya está en uso",
        });
      }

      const result = await pool.query(
        `UPDATE usuarios
         SET nombre = COALESCE(NULLIF($1, ''), nombre),
             nombre_usuario = $2
         WHERE id = $3
         RETURNING ${"id, nombre, nombre_usuario, correo, rol, proveedor_auth, created_at"}`,
        [nombre || null, usuarioNorm, req.user.id]
      );

      return res.json({
        success: true,
        message: "Perfil actualizado correctamente",
        user: publicUser(result.rows[0]),
      });
    }

    const result = await pool.query(
      `UPDATE usuarios
       SET nombre = COALESCE(NULLIF($1, ''), nombre)
       WHERE id = $2
       RETURNING ${"id, nombre, nombre_usuario, correo, rol, proveedor_auth, created_at"}`,
      [nombre || null, req.user.id]
    );

    return res.json({
      success: true,
      message: "Perfil actualizado correctamente",
      user: publicUser(result.rows[0]),
    });
  } catch (error) {
    console.error("❌ Error actualizando perfil:", error);
    return res.status(500).json({
      success: false,
      message: "Error actualizando el perfil",
    });
  }
}