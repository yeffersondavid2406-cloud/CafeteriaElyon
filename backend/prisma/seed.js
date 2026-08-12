import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categorias = [
  { nombre: "Comida", descripcion: "Platos y comidas de la cafetería" },
  { nombre: "Bebidas", descripcion: "Bebidas y refrescos" },
  { nombre: "Postres", descripcion: "Postres y dulces" },
  { nombre: "Snacks", descripcion: "Snacks y pasabocas" },
  { nombre: "Panadería", descripcion: "Productos de panadería" },
];

const productos = [
  {
    nombre: "Hamburguesa Clásica",
    descripcion: "Hamburguesa con carne, queso, lechuga y tomate.",
    precio: 12000,
    imagen: null,
    categoria: "Comida",
    stock: 20,
    destacado: true,
  },
  {
    nombre: "Perro Caliente",
    descripcion: "Perro caliente con salchicha, queso y salsas.",
    precio: 9000,
    imagen: null,
    categoria: "Comida",
    stock: 25,
    destacado: true,
  },
  {
    nombre: "Café",
    descripcion: "Café recién preparado.",
    precio: 3000,
    imagen: null,
    categoria: "Bebidas",
    stock: 50,
    destacado: true,
  },
  {
    nombre: "Jugo Natural",
    descripcion: "Jugo natural de frutas.",
    precio: 5000,
    imagen: null,
    categoria: "Bebidas",
    stock: 40,
    destacado: true,
  },
  {
    nombre: "Empanada",
    descripcion: "Empanada de carne.",
    precio: 2500,
    imagen: null,
    categoria: "Comida",
    stock: 30,
    destacado: false,
  },
  {
    nombre: "Sándwich",
    descripcion: "Sándwich de jamón y queso.",
    precio: 8000,
    imagen: null,
    categoria: "Comida",
    stock: 15,
    destacado: false,
  },
  {
    nombre: "Brownie",
    descripcion: "Brownie de chocolate.",
    precio: 4000,
    imagen: null,
    categoria: "Postres",
    stock: 20,
    destacado: true,
  },
];

async function main() {
  console.log("Iniciando seed de Cafetería Elyon...");

  const adminPassword = await bcrypt.hash("Admin12345!", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@cafeteriaelyon.com" },
    update: {},
    create: {
      nombre: "Administrador",
      email: "admin@cafeteriaelyon.com",
      password: adminPassword,
      telefono: null,
      rol: "ADMIN",
      activo: true,
    },
  });
  console.log(`Administrador creado: ${admin.email}`);

  const categoriaMap = {};

  for (const cat of categorias) {
    const categoria = await prisma.categoria.upsert({
      where: { nombre: cat.nombre },
      update: {},
      create: cat,
    });
    categoriaMap[cat.nombre] = categoria.id;
  }
  console.log(`Categorías creadas: ${Object.keys(categoriaMap).length}`);

  for (const prod of productos) {
    const existing = await prisma.producto.findFirst({
      where: { nombre: prod.nombre },
    });

    const producto =
      existing ||
      (await prisma.producto.create({
        data: {
          nombre: prod.nombre,
          descripcion: prod.descripcion,
          precio: prod.precio,
          imagen: prod.imagen,
          categoriaId: categoriaMap[prod.categoria],
          stock: prod.stock,
          destacado: prod.destacado,
          disponible: true,
        },
      }));

    await prisma.inventario.upsert({
      where: { productoId: producto.id },
      update: {},
      create: {
        productoId: producto.id,
        cantidad: prod.stock,
        stockMinimo: 5,
      },
    });
  }
  console.log(`Productos creados: ${productos.length}`);

  console.log("Seed completado correctamente.");
}

main()
  .catch((e) => {
    console.error("Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });