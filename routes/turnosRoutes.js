// routes/turnosRoutes.js
// Capa de rutas: SOLO define los endpoints y los asocia a su controlador.

const { Router } = require('express');
const turnosController = require('../controllers/turnosController');

const router = Router();

router.get('/', turnosController.listarTurnos);    // GET  /api/turnos
router.get('/:id', turnosController.obtenerTurno); // GET  /api/turnos/:id
router.post('/', turnosController.crearTurno);     // POST /api/turnos

module.exports = router;
