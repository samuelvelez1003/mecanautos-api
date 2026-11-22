// index.js
// Punto de entrada: SOLO inicializa Express, configura middlewares,
// conecta las rutas y levanta el servidor. No contiene lógica de negocio.

const express = require('express');
const turnosRoutes = require('./routes/turnosRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para leer cuerpos JSON (req.body)
app.use(express.json());

// Rutas de la API
app.use('/api/turnos', turnosRoutes);

// Ruta inexistente -> 404 en JSON
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.originalUrl} no encontrada` });
});

// JSON mal escrito en el body -> 400 (en vez de una página de error HTML)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`MecanAutos API escuchando en http://localhost:${PORT}`);
});
