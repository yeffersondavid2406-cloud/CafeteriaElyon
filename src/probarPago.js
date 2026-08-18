const response = await fetch("http://localhost:3000/api/pagos/2/estado", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    estado: "pagado",
  }),
});

const data = await response.json();

console.log(data);