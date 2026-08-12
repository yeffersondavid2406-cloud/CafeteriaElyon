export function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Datos inválidos",
        errors: result.error.errors.map((e) => ({
          campo: e.path.join("."),
          mensaje: e.message,
        })),
      });
    }

    req[source] = result.data;
    next();
  };
}