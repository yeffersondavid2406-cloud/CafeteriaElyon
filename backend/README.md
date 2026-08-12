# CAFETERÍA ELYON — Backend API

API REST de la Cafetería Elyon construida con Node.js, Express, Prisma y **Supabase (PostgreSQL)**.

## 1. Requisitos

- Node.js 18 o superior
- pnpm 8 o superior
- Cuenta en [Supabase](https://supabase.com) con un proyecto creado

## 2. Instalación

```bash
cd backend
pnpm install
```

## 3. Crear el proyecto en Supabase

1. Entra a [Supabase](https://supabase.com) y crea un proyecto nuevo (nómbralo `cafeteria-elyon`).
2. En **Project Settings → Database** encontrarás las cadenas de conexión:
   - **Pooler (Transaction mode)** → puerto `6543` (usada en `DATABASE_URL`).
   - **Direct connection** → puerto `5432` (usada en `DIRECT_URL` para migraciones).
3. Guarda la contraseña de la base de datos (la defines al crear el proyecto).
4. En **Settings → API**, el panel `Project Ref` y la `Region` completan las URLs:

```
DATABASE_URL="postgresql://postgres.PROYECTO_REF:CONTRASEÑA@aws-0-REGION.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.PROYECTO_REF:CONTRASEÑA@aws-0-REGION.pooler.supabase.com:5432/postgres"
```

## 4. Configuración de `.env`

Copia `.env.example` a `.env` y pega tus URLs reales de Supabase:

```env
DATABASE_URL="postgresql://postgres.PROYECTO_REF:CONTRASEÑA@aws-0-REGION.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.PROYECTO_REF:CONTRASEÑA@aws-0-REGION.pooler.supabase.com:5432/postgres"
PORT=3000
JWT_SECRET="CAMBIAR_ESTE_SECRETO_POR_UNO_SEGURO"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
```

Nunca subas `.env` a GitHub.

## 5. Instalación de dependencias

```bash
pnpm install
```

## 6. Migraciones Prisma

```bash
pnpm prisma:migrate
```

O de forma explícita:

```bash
pnpm exec prisma migrate dev --name init
```

> Prisma usa `DIRECT_URL` para aplicar migraciones en Supabase.

## 7. Seed

Insertar categorías, productos de ejemplo y el administrador:

```bash
pnpm db:seed
```

## 8. Iniciar el servidor

```bash
pnpm dev        # desarrollo con nodemon
pnpm start      # producción
```

El servidor inicia en `http://localhost:3000`.

## 9. Endpoints

### Health

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Estado de la API |

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Usuario actual (token) |

### Usuarios (ADMIN)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users` | Listar usuarios |
| PUT | `/api/users/:id` | Actualizar usuario |

### Productos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products` | Listar productos |
| GET | `/api/products/featured` | Destacados |
| GET | `/api/products/search?q=...` | Buscar |
| GET | `/api/products/category/:categoryId` | Por categoría |
| GET | `/api/products/:id` | Detalle |
| POST | `/api/products` | Crear (ADMIN/EMPLEADO) |
| PUT | `/api/products/:id` | Actualizar (ADMIN/EMPLEADO) |
| DELETE | `/api/products/:id` | Eliminar (ADMIN) |

### Categorías

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/categories` | Listar |
| GET | `/api/categories/:id` | Detalle |
| POST | `/api/categories` | Crear (ADMIN) |
| PUT | `/api/categories/:id` | Actualizar (ADMIN) |
| DELETE | `/api/categories/:id` | Eliminar (ADMIN) |

### Pedidos (autenticado)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/orders` | Crear pedido |
| GET | `/api/orders` | Listar (cliente: solo suyos) |
| GET | `/api/orders/my-orders` | Pedidos del cliente |
| GET | `/api/orders/:id` | Detalle |
| PUT | `/api/orders/:id/status` | Cambiar estado (ADMIN/EMPLEADO) |
| DELETE | `/api/orders/:id` | Eliminar (ADMIN) |

### Inventario (ADMIN/EMPLEADO)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/inventory` | Listar |
| GET | `/api/inventory/low-stock` | Stock bajo |
| GET | `/api/inventory/:productId` | Por producto |
| PUT | `/api/inventory/:productId` | Actualizar |

### Promociones

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/promotions` | Activas |
| GET | `/api/promotions/:id` | Detalle |
| POST | `/api/promotions` | Crear (ADMIN) |
| PUT | `/api/promotions/:id` | Actualizar (ADMIN) |
| DELETE | `/api/promotions/:id` | Eliminar (ADMIN) |

### Dashboard (ADMIN)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/dashboard/summary` | Resumen |
| GET | `/api/dashboard/sales` | Estadísticas de ventas |
| GET | `/api/dashboard/top-products` | Más vendidos |

## 10. Autenticación

Enviar el token JWT en cada petición protegida:

```
Authorization: Bearer TOKEN
```

## 11. Roles

- `CLIENTE` — puede registrarse, ver productos y gestionar sus pedidos.
- `EMPLEADO` — puede crear/editar productos y cambiar estados de pedidos.
- `ADMIN` — acceso total, incluyendo dashboard e inventario.

## 12. Estructura del proyecto

```
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── env.js
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── middlewares/
│   ├── validators/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── .env
├── .env.example
├── package.json
└── README.md
```

## Usuario administrador (seed)

- **Email:** `admin@cafeteriaelyon.com`
- **Password:** `Admin12345!`