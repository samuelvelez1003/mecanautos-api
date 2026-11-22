// controllers/turnosController.js
// Capa de controladores: recibe la petición (req), valida la entrada,
// llama al servicio y responde (res) con el código HTTP correcto.

const turnosService = require('../services/turnosService');

const CAMPOS_TEXTO = ['cliente', 'telefono', 'placa', 'vehiculo', 'tipoServicio', 'fecha'];
const CAMPOS_NUMERICOS = ['precioBase', 'kilometraje'];

// GET /api/turnos -> 200
function listarTurnos(req, res) {
  const turnos = turnosService.listar();
  res.status(200).json(turnos);
}

// GET /api/turnos/:id -> 200 | 404
function obtenerTurno(req, res) {
  const turno = turnosService.buscarPorId(req.params.id);
  if (!turno) {
    return res.status(404).json({ error: `No existe un turno con id ${req.params.id}` });
  }
  res.status(200).json(turno);
}

// POST /api/turnos -> 201 | 400
function crearTurno(req, res) {
  const errores = validarTurno(req.body);
  if (errores.length > 0) {
    return res.status(400).json({ error: 'Datos inválidos', detalles: errores });
  }
  const turno = turnosService.crear(req.body);
  res.status(201).json(turno);
}

function validarTurno(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['El cuerpo de la petición debe ser un objeto JSON'];
  }

  const errores = [];

  for (const campo of CAMPOS_TEXTO) {
    if (typeof body[campo] !== 'string' || body[campo].trim() === '') {
      errores.push(`El campo "${campo}" es obligatorio y debe ser texto`);
    }
  }

  for (const campo of CAMPOS_NUMERICOS) {
    const valor = body[campo];
    if (valor === undefined || valor === null || valor === '') {
      errores.push(`El campo "${campo}" es obligatorio`);
    } else if (typeof valor !== 'number' || !Number.isFinite(valor)) {
      errores.push(`El campo "${campo}" debe ser un número`);
    } else if (valor <= 0) {
      errores.push(`El campo "${campo}" debe ser mayor que cero`);
    }
  }

  if (typeof body.tipoServicio === 'string' && body.tipoServicio.trim() !== ''
      && !turnosService.TIPOS_SERVICIO.includes(body.tipoServicio)) {
    errores.push(`"tipoServicio" debe ser uno de: ${turnosService.TIPOS_SERVICIO.join(', ')}`);
  }

  if (typeof body.placa === 'string' && body.placa.trim() !== ''
      && !/^[A-Z]{3}\d{2}[A-Z0-9]$/i.test(body.placa.trim())) {
    errores.push('"placa" debe tener formato colombiano: ABC123 (carro) o ABC12D (moto)');
  }

  if (typeof body.fecha === 'string' && body.fecha.trim() !== '' && Number.isNaN(Date.parse(body.fecha))) {
    errores.push('"fecha" debe ser una fecha válida, por ejemplo "2026-11-25T09:00"');
  }

  if (body.prioritario !== undefined && typeof body.prioritario !== 'boolean') {
    errores.push('"prioritario" debe ser true o false');
  }

  return errores;
}

module.exports = { listarTurnos, obtenerTurno, crearTurno };
