# MecanAutos API

Este es nuestro taller final de Arquitectura de Software en la CIAF. Hicimos una API REST con Node.js y Express para manejar los turnos de un taller mecánico, separada en rutas, controladores y servicios.

## Integrantes

Grupo 2 martes, ordenados por apellido:

| # lista | Apellidos | Nombres |
|---|---|---|
| 7 | Melo Largo | Jhon Jairo |
| 13 | Velez Velasquez | Bryan Samuel |

## Nuestro N

Al ordenarnos por apellido, el primero es Jhon Jairo (Melo Largo), que es el número 7 de la lista. Entonces nos quedó:

- N = 7
- Recargo = 7 x 2% = 14%

Lo aplicamos en `services/turnosService.js`. Si el turno es prioritario, al precio base le sumamos el 14%. Si no es prioritario, o no mandan ese dato, se cobra solo el precio base.

Estos son algunos resultados que nos dio la API:

| Servicio | Precio base | Prioritario | Recargo | Total a pagar |
|---|---|---|---|---|
| Escáner | 80.000 | sí | 11.200 | 91.200 |
| Frenos | 250.000 | sí | 35.000 | 285.000 |
| Mecánica general | 150.000 | no | 0 | 150.000 |

## Por qué MecanAutos

Escogimos MecanAutos porque es un taller real que conocemos. Queda en el barrio Berlín de Pereira (Cll 6 # 10-46) y lleva trabajando desde 1997. Le hacen mantenimiento y reparación a carros y motos: mecánica general, cambio de aceite, frenos y diagnóstico con escáner.

Allá los clientes piden la cita por WhatsApp, entonces pensamos la API como el lugar donde quedarían guardadas esas citas. Y cuando alguien necesita el carro con urgencia, el turno se marca como prioritario: lo atienden primero y por eso se cobra el recargo.

### Qué pedimos para un turno

| Campo | Tipo | Obligatorio | Para qué |
|---|---|---|---|
| `cliente` | texto | sí | Nombre de quien lleva el vehículo |
| `telefono` | texto | sí | Para avisarle cuando esté listo |
| `placa` | texto | sí | De carro (ABC123) o de moto (ABC12D) |
| `vehiculo` | texto | sí | Marca, línea y modelo, por ejemplo "Mazda 3 2020" |
| `kilometraje` | número mayor a 0 | sí | Con cuántos km llega |
| `tipoServicio` | texto | sí | "Mecánica general", "Cambio de aceite", "Frenos" o "Escáner" |
| `fecha` | texto con fecha | sí | Día y hora del turno, por ejemplo "2026-11-25T09:00" |
| `precioBase` | número mayor a 0 | sí | Lo que vale el servicio, en pesos |
| `prioritario` | true / false | no | Si es urgente. Si no lo mandan, queda en false |

Al crear el turno, la API le pone el `id`, el `porcentajeRecargo`, el `recargo`, el `totalPagar`, el `estado` (arranca en "Recibido") y la fecha en que se creó (`creadoEn`).

## Cómo lo organizamos

```
mecanautos-api/
├── index.js
├── routes/turnosRoutes.js
├── controllers/turnosController.js
└── services/turnosService.js
```

Una petición pasa por las capas en este orden:

```
index.js -> routes -> controllers (valida) -> services (calcula y guarda) -> controllers (responde)
```

- `index.js`: solo configura Express, activa `express.json()`, conecta las rutas y prende el servidor. También responde 404 si piden una ruta que no existe y 400 si el body no es un JSON válido, para que el servidor no se caiga.
- `routes`: solo dice qué función atiende cada URL.
- `controllers`: es la única parte que usa `req` y `res`. Aquí revisamos que lleguen los campos y que los números sean mayores a 0, y decidimos si se responde 200, 201, 400 o 404.
- `services`: no sabe nada de HTTP. Aquí está N, el cálculo del recargo y el arreglo donde guardamos los turnos.

No usamos base de datos, los turnos quedan en un arreglo en memoria. Por eso, si se reinicia el servidor, se pierden los que se hayan creado. Para que no arranque vacío le dejamos 2 turnos de prueba.

## Cómo correrlo

Se necesita Node.js 18 o más nuevo.

```bash
npm install
npm start
```

Queda en http://localhost:3000. Si ese puerto está ocupado se puede cambiar con `PORT=4000 npm start`.

## Endpoints

| Método | Ruta | Qué responde |
|---|---|---|
| GET | `/api/turnos` | 200 con todos los turnos |
| GET | `/api/turnos/:id` | 200 con el turno, o 404 si ese id no existe |
| POST | `/api/turnos` | 201 con el turno creado y su total, o 400 si los datos están mal |

## Pruebas

Se puede probar con Postman o Thunder Client. Estos son los casos que usamos.

### POST que funciona (201)

Body:

```json
{
  "cliente": "Andrea Muñoz",
  "telefono": "3104567890",
  "placa": "XYZ789",
  "vehiculo": "Mazda 3 2020",
  "kilometraje": 45000,
  "tipoServicio": "Escáner",
  "fecha": "2026-11-25T09:00",
  "precioBase": 80000,
  "prioritario": true
}
```

Nos respondió 201 Created:

```json
{
  "id": 3,
  "cliente": "Andrea Muñoz",
  "telefono": "3104567890",
  "placa": "XYZ789",
  "vehiculo": "Mazda 3 2020",
  "kilometraje": 45000,
  "tipoServicio": "Escáner",
  "fecha": "2026-11-25T09:00",
  "precioBase": 80000,
  "prioritario": true,
  "porcentajeRecargo": 14,
  "recargo": 11200,
  "totalPagar": 91200,
  "estado": "Recibido",
  "creadoEn": "2026-11-22T06:07:22.773Z"
}
```

La cuenta es 80.000 + 80.000 x (14 / 100) = 80.000 + 11.200 = 91.200.

### POST con errores (400)

En este le quitamos el teléfono, pusimos el precio y el kilometraje en 0 o negativos, pedimos "Pintura" (que el taller no hace) y mandamos `prioritario` como texto.

Body:

```json
{
  "cliente": "Pedro Gómez",
  "placa": "ABC123",
  "vehiculo": "Kia Picanto",
  "kilometraje": 0,
  "tipoServicio": "Pintura",
  "fecha": "2026-11-25T09:00",
  "precioBase": -50000,
  "prioritario": "si"
}
```

Nos respondió 400 Bad Request con todos los errores juntos:

```json
{
  "error": "Datos inválidos",
  "detalles": [
    "El campo \"telefono\" es obligatorio y debe ser texto",
    "El campo \"precioBase\" debe ser mayor que cero",
    "El campo \"kilometraje\" debe ser mayor que cero",
    "\"tipoServicio\" debe ser uno de: Mecánica general, Cambio de aceite, Frenos, Escáner",
    "\"prioritario\" debe ser true o false"
  ]
}
```

### Id que no existe (404)

Si pedimos `GET /api/turnos/999` nos responde 404:

```json
{ "error": "No existe un turno con id 999" }
```
