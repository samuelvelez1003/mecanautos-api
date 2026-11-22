// services/turnosService.js
// Capa de servicios: lógica de negocio, cálculo de la tarifa y gestión de los datos.
// No conoce req ni res: recibe datos ya validados y devuelve objetos.

// ---------------- Regla de negocio parametrizada ----------------
// N = número de lista oficial del primer integrante del equipo
//     (integrantes ordenados alfabéticamente por apellido).
//     Melo Largo Jhon Jairo es el #7 de la lista del Grupo 2 -> N = 7.
const N = 7;
const PORCENTAJE_RECARGO = N * 2; // N × 2 %  ->  7 × 2 = 14 %

// Servicios que ofrece MecanAutos
const TIPOS_SERVICIO = ['Mecánica general', 'Cambio de aceite', 'Frenos', 'Escáner'];

// ---------------- Almacenamiento en memoria ----------------
const turnos = [];
let siguienteId = 1;

/**
 * Calcula el valor final de un turno.
 * - prioritario === true -> totalPagar = precioBase + precioBase × (porcentajeRecargo / 100)
 * - en otro caso          -> totalPagar = precioBase
 */
function calcularTarifa(precioBase, prioritario) {
  const recargo = prioritario === true ? precioBase * (PORCENTAJE_RECARGO / 100) : 0;
  return {
    porcentajeRecargo: prioritario === true ? PORCENTAJE_RECARGO : 0,
    recargo: redondear(recargo),
    totalPagar: redondear(precioBase + recargo),
  };
}

function redondear(valor) {
  return Math.round(valor * 100) / 100;
}

function listar() {
  return turnos;
}

function buscarPorId(id) {
  return turnos.find((t) => t.id === Number(id)) || null;
}

function crear(datos) {
  const prioritario = datos.prioritario === true;
  const tarifa = calcularTarifa(datos.precioBase, prioritario);

  const turno = {
    id: siguienteId++,
    cliente: datos.cliente.trim(),
    telefono: datos.telefono.trim(),
    placa: datos.placa.trim().toUpperCase(),
    vehiculo: datos.vehiculo.trim(),
    kilometraje: datos.kilometraje,
    tipoServicio: datos.tipoServicio,
    fecha: datos.fecha,
    precioBase: datos.precioBase,
    prioritario,
    ...tarifa,
    estado: 'Recibido',
    creadoEn: new Date().toISOString(),
  };

  turnos.push(turno);
  return turno;
}

// Datos de ejemplo para que GET /api/turnos no arranque vacío
crear({
  cliente: 'Carlos Ramírez', telefono: '3001234567', placa: 'ABC123',
  vehiculo: 'Chevrolet Spark GT 2016', kilometraje: 98500,
  tipoServicio: 'Cambio de aceite', fecha: '2026-11-24T08:00', precioBase: 120000,
});
crear({
  cliente: 'Luisa Fernanda Ospina', telefono: '3157654321', placa: 'KLM456',
  vehiculo: 'Renault Logan 2019', kilometraje: 61200,
  tipoServicio: 'Frenos', fecha: '2026-11-24T10:30', precioBase: 250000, prioritario: true,
});

module.exports = {
  N,
  PORCENTAJE_RECARGO,
  TIPOS_SERVICIO,
  calcularTarifa,
  listar,
  buscarPorId,
  crear,
};
