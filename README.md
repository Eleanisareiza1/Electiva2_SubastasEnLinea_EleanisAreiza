# Plataforma de Subastas en Línea

## Información General

**Asignatura:** Electiva II - Desarrollo de Software

**Programa:** Ingeniería de Software

**Proyecto:** Plataforma de Subastas en Línea

**Equipo:** Equipo Ele

**Integrante:** - Eleanis Areiza López

# Estado Académico

Entrega 1: Modelado del dominio y recursos iniciales de la API.

Entrega 2: API completa con persistencia real mediante MongoDB Atlas y comunicación en tiempo real mediante Socket.IO.

Entrega 3: Integración con la aplicación web (Angular), autenticación con sesión persistente, webhook de pagos terminado y pasarela de pagos simulada.

---

## Descripción del Proyecto

La Plataforma de Subastas en Línea permite la publicación y gestión de subastas, el registro de pujas por parte de los usuarios y la difusión de eventos en tiempo real mediante WebSockets.

El sistema fue construido siguiendo los principios de Arquitectura Hexagonal, manteniendo el dominio desacoplado de los mecanismos de persistencia, transporte y comunicación.

En el proyecto conviven las tres formas de comunicación que exige el negocio:

- **API REST:** la aplicación web pregunta y el servidor responde.
- **WebSockets:** el servidor informa al cliente sin que este pregunte.
- **Webhook:** la pasarela de pagos informa al servidor sin que este pregunte.

Actualmente la aplicación ofrece:

- Registro de usuarios, inicio de sesión con token y perfil con subastas publicadas y en las que participó.
- Publicación de subastas con artículo, categoría y estado de conservación.
- Consulta de subastas con filtros por categoría, estado y texto, y con paginación.
- Detalle de una subasta con su estado, oferta vigente e historial público de pujas.
- Registro de pujas con rechazo explicado según la regla incumplida.
- Cancelación de subastas que aún no reciben pujas.
- Cierre perezoso y adjudicación automática al llegar la fecha de cierre.
- Generación de órdenes de pago para el ganador con plazo de 48 horas.
- Consulta de intentos de puja fallidos (auditoría).
- Persistencia real mediante MongoDB Atlas (o en memoria, sin modificar el dominio).
- Comunicación en tiempo real mediante Socket.IO.
- Notificaciones de nuevas pujas, usuarios superados, cierre, adjudicación y pago.
- Webhook de pagos con verificación de origen y procesamiento idempotente.
- Pasarela de pagos simulada para recorrer el ciclo completo.
- Aplicación web en Angular que consume la API y se actualiza en tiempo real.
- Middleware global para el manejo uniforme de errores.

---

# Arquitectura Utilizada

El proyecto está organizado siguiendo el modelo de Arquitectura Hexagonal.

La intención principal es mantener las reglas del negocio independientes de frameworks, librerías externas, mecanismos de persistencia y detalles de infraestructura.

```
Aplicación web ──HTTP────▶ infraestructura/http ───────┐
Aplicación web ◀─WebSocket── infraestructura/socket ◀──┤ puerto NotificacionPort
Pasarela ──────HTTP────▶ infraestructura/http (webhook)│
                                     │                 │
                              aplicación (casos de uso) ┘
                                     │
                              dominio (Subasta y reglas)
                                     │
                     puertos de repositorio ──▶ infraestructura/repositories (mongo | memoria)
```

## Correspondencia con Arquitectura Hexagonal

| Carpeta | Capa |
|----------|----------|
| domain | Dominio |
| application | Aplicación |
| infrastructure | Infraestructura |
| frontend-subastas | Cliente (aplicación web) |

## Capas implementadas

### Domain

Contiene las entidades, los objetos de valor, los puertos de persistencia y **todas** las reglas de negocio.

Ruta: src/domain

Archivos:

Subasta.ts (raíz de agregado)
Articulo.ts
Puja.ts
IntentoPujaFallida.ts
OrdenPago.ts
Usuario.ts
Categoria.ts
EventoPago.ts
Notificacion.ts

valueObjects/
├── Dinero.ts
├── Correo.ts
├── EstadoSubasta.ts
├── EstadoPago.ts
├── EstadoConservacion.ts
├── ResultadoPago.ts
└── TipoNotificacion.ts

repositories/
├── SubastaRepository.ts
├── UsuarioRepository.ts
├── CategoriaRepository.ts
├── EventoPagoRepository.ts
└── NotificacionRepository.ts

errors/
└── ErrorDominio.ts

Responsabilidades:

- Contener las reglas de negocio.
- Garantizar la consistencia del dominio.
- Definir los contratos necesarios para acceder a la persistencia.
- Permanecer independiente de Express, Socket.IO, Mongoose, JWT o cualquier infraestructura (no importa ninguna librería externa).

Modelo:

- **Raíz de agregado:** `Subasta`. Su frontera de consistencia incluye `Articulo`, `Puja`, `IntentoPujaFallida` y `OrdenPago`; ninguno se modifica sin pasar por la subasta.
- **Entidades con identidad propia:** `Usuario`, `Categoria`, `Notificacion`, `EventoPago`.
- **Objetos de valor:** `Dinero`, `Correo` y los estados. Son inmutables y se validan al crearse.
- **Concepto adicional:** `ErrorDominio`, para que cada rechazo lleve el código de la regla incumplida (por ejemplo `RN-09`) sin que el dominio conozca HTTP.

---

### Application

Contiene los casos de uso, los puertos de salida y los servicios que coordinan el dominio.

Ruta: src/application

Archivos:

useCases/
├── RegistrarUsuario.ts
├── IniciarSesion.ts
├── ConsultarPerfil.ts
├── ListarCategorias.ts
├── PublicarSubasta.ts
├── ListarSubastas.ts
├── ConsultarDetalleSubasta.ts
├── CancelarSubasta.ts
├── RegistrarPuja.ts
├── ConsultarIntentosFallidos.ts
├── ConsultarOrdenesPago.ts
├── ProcesarEventoPago.ts
├── ConsultarNotificaciones.ts
└── MarcarNotificacionLeida.ts

ports/
├── NotificacionPort.ts
├── CifradorContrasenas.ts
├── GeneradorTokens.ts
└── GeneradorIds.ts

services/
├── SincronizadorSubastas.ts
├── AvisadorNegocio.ts
├── ConstructorContexto.ts
└── Vistas.ts

Responsabilidades:

- Coordinar la ejecución del dominio: recuperar la subasta, pedirle que actúe y guardarla.
- Utilizar los puertos definidos en el dominio y en esta capa.
- Anunciar los hechos del negocio por el puerto `NotificacionPort`, sin conocer WebSockets.
- Aplicar el cierre perezoso (`SincronizadorSubastas`).
- Entregar vistas sin datos de contacto de los postores (`Vistas.ts`).
- Mantenerse independiente de HTTP y de los detalles de la infraestructura.

---

### Infrastructure

Contiene los adaptadores de entrada y salida.

Ruta: src/infrastructure

Archivos:

http/
├── rutas.ts
├── validaciones.ts
├── controllers/
│   ├── AuthController.ts
│   ├── SubastaController.ts
│   ├── OrdenController.ts
│   ├── NotificacionController.ts
│   └── WebhookController.ts
└── middlewares/
    ├── autenticacion.ts
    └── manejoErrores.ts

repositories/
├── categoriasIniciales.ts
├── mongo/
│   ├── conexion.ts
│   ├── modelos.ts
│   ├── MongoSubastaRepository.ts
│   └── MongoRepositorios.ts
└── memoria/
    └── MemoriaRepositorios.ts

socket/
├── ServidorTiempoReal.ts
└── SocketIONotificacionAdapter.ts

auth/
├── BcryptCifrador.ts
├── JwtGeneradorTokens.ts
├── UuidGeneradorIds.ts
└── FirmaPasarela.ts

config/
└── entorno.ts

herramientas/
├── datosDemo.ts
└── pasarelaSimulada.ts

contenedor.ts

Responsabilidades:

- Recibir solicitudes HTTP, validar su formato y delegar en los casos de uso.
- Exponer la API REST, la API de WebSockets y el webhook.
- Implementar los repositorios concretos (MongoDB y memoria).
- Implementar los puertos de salida (Socket.IO, bcrypt, JWT, UUID).
- Conectar todas las piezas en un solo lugar (`contenedor.ts`).

---

# Estructura del Proyecto

```
Electiva2_SubastasEnLinea_EleanisAreiza
├── docs
│   └── openapi.yaml
├── frontend-subastas        (aplicación web Angular)
├── src
│   ├── application
│   │   ├── ports
│   │   ├── services
│   │   └── useCases
│   ├── domain
│   │   ├── errors
│   │   ├── repositories
│   │   ├── valueObjects
│   │   └── entidades (Subasta.ts, Articulo.ts, Puja.ts, ...)
│   ├── infrastructure
│   │   ├── auth
│   │   ├── config
│   │   ├── herramientas
│   │   ├── http
│   │   │   ├── controllers
│   │   │   └── middlewares
│   │   ├── repositories
│   │   │   ├── memoria
│   │   │   └── mongo
│   │   ├── socket
│   │   └── contenedor.ts
│   ├── tests
│   │   ├── domain
│   │   └── http
│   ├── app.ts
│   └── server.ts
├── .env.example
├── .gitignore
├── jest.config.js
├── package.json
├── tsconfig.json
└── README.md
```

---

# Reglas de Negocio Implementadas

Todas las reglas se hacen cumplir dentro del dominio. Para cada una se indica el lugar exacto del código.

## Publicación de Subastas

### RN-01
Toda subasta debe tener:
- Precio base mayor que cero.
- Incremento mínimo mayor que cero.
- Fecha y hora de cierre.

Dónde: `Subasta.publicar()` en `src/domain/Subasta.ts`.

### RN-02
La fecha de cierre debe ser posterior a la fecha de publicación. Una subasta no puede nacer vencida.

Dónde: `Subasta.publicar()`.

### RN-03
La duración de la subasta debe ser:
- Mínimo una hora.
- Máximo treinta días.

Dónde: `Subasta.publicar()` con las constantes `DURACION_MINIMA_MS` y `DURACION_MAXIMA_MS`.

### RN-04
Una subasta solo puede cancelarse si todavía no ha recibido pujas, y solo la puede cancelar su vendedor.

Dónde: `Subasta.cancelar()`.

### RN-05
Los datos de una subasta publicada no pueden modificarse (precio base, incremento mínimo y fecha de cierre).

Dónde: propiedades `readonly` de `Subasta`; no existe ningún método ni endpoint de modificación, y `Dinero` es inmutable.

---

## Gestión de Pujas

### RN-06
Solo se aceptan pujas sobre subastas abiertas y dentro de su plazo. Una subasta cerrada, cancelada o desierta no admite ofertas.

Dónde: `Subasta.registrarPuja()`.

### RN-07
El vendedor no puede pujar sobre su propia subasta.

Dónde: `Subasta.registrarPuja()`.

### RN-08
La primera puja debe ser mayor o igual al precio base de la subasta.

Dónde: `Subasta.registrarPuja()`.

### RN-09
Toda puja posterior debe superar la oferta vigente en al menos el incremento mínimo. Una oferta igual a la vigente se rechaza.

Dónde: `Subasta.registrarPuja()`.

### RN-10
Un usuario no puede superar su propia puja cuando ya es el mejor postor de la subasta.

Dónde: `Subasta.registrarPuja()`.

### RN-11
Una puja aceptada es irrevocable.

Dónde: `Puja` solo tiene propiedades `readonly`; `Subasta.obtenerPujas()` entrega una copia y no existe operación de retiro.

### RN-12
Toda puja rechazada se registra como intento fallido junto con el motivo del rechazo.

Dónde: método privado `Subasta.rechazar()`; el caso de uso `RegistrarPuja` guarda la subasta también cuando la puja se rechaza, para que el intento quede persistido.

---

## Gestión de Subasta

### RN-13
Al llegar la fecha de cierre, la subasta con al menos una puja se adjudica al autor de la oferta más alta.

Dónde: `Subasta.cerrar()`.

### RN-14
Una subasta que llega a su fecha de cierre sin pujas se declara desierta y no genera obligación de pago.

Dónde: `Subasta.cerrar()`.

### RN-15
La adjudicación genera una orden de pago por el valor de la puja ganadora, a nombre del ganador, con un plazo de cuarenta y ocho horas.

Dónde: `OrdenPago.emitir()` en `src/domain/OrdenPago.ts`.

### RN-16
Una subasta no puede cerrarse más de una vez ni generar una segunda orden de pago.

Dónde: `Subasta.cerrar()` y `Subasta.verificarCierre()`.

**Cierre perezoso:** `SincronizadorSubastas` (capa de aplicación) verifica el cierre cada vez que una subasta se lista, se consulta, recibe una puja o se cancela. No existe un proceso en segundo plano.

---

## Pagos

### RN-17
El pago se confirma únicamente cuando la pasarela lo notifica.

Dónde: `Subasta.registrarResultadoPago()`, único camino hacia `OrdenPago.confirmarPago()`.

### RN-18
Una notificación cuyo origen no pueda verificarse se rechaza sin producir cambios.

Dónde: `firmaValida()` en `src/infrastructure/auth/FirmaPasarela.ts`, que `WebhookController` ejecuta antes de cualquier otra cosa.

### RN-19
La misma notificación se procesa una sola vez y se responde de forma idéntica en los reenvíos.

Dónde: caso de uso `ProcesarEventoPago` junto con `EventoPagoRepository`, que guarda la respuesta del primer procesamiento.

### RN-20
Si vence el plazo sin confirmación, la orden se declara vencida y la subasta queda en incumplimiento.

Dónde: `Subasta.verificarVencimientoPago()`.

---

## Reglas Monetarias

### RN-21
Los valores monetarios:
- Se expresan en pesos colombianos.
- No pueden ser negativos.
- No pueden contener valores decimales.

Dónde: objeto de valor `Dinero` en `src/domain/valueObjects/Dinero.ts`.

---

## Usuarios e Información

### RN-22
El correo electrónico de un usuario es único dentro de la plataforma.

Dónde: caso de uso `RegistrarUsuario` (con el objeto de valor `Correo`, que normaliza mayúsculas y espacios) y el índice único en `MongoUsuarioRepository`.

### RN-23
El historial de pujas es público para cualquier usuario registrado; los datos de contacto de los postores no lo son.

Dónde: `aVistaDetalle()` en `src/application/services/Vistas.ts`, que solo expone el id y el nombre del postor.

---

# Recursos de la API

Base: `http://localhost:5000/api/v1`. Las rutas marcadas con 🔒 requieren la cabecera `Authorization: Bearer <token>`.

La especificación completa, con ejemplos de peticiones y respuestas, está en **`docs/openapi.yaml`** (se puede abrir en https://editor.swagger.io).

## Usuarios

| Método | Ruta | Descripción |
|---|---|---|
| POST | /auth/register | Registrar usuario (nombre, correo, password) |
| POST | /auth/login | Iniciar sesión; devuelve el token |
| GET  | /auth/profile | Perfil con subastas publicadas y en las que participó |

## Crear Subasta

**Endpoint** 

POST http://localhost:5000/api/v1/subastas

**Body**
```json
{
  "nombre": "Laptop Gamer",
  "descripcion": "Portátil con tarjeta gráfica dedicada",
  "estadoConservacion": "USADO",
  "categoriaId": "tecnologia",
  "imagenUrl": null,
  "precioBase": 1000000,
  "incrementoMinimo": 50000,
  "fechaCierre": "2026-11-20T18:00:00-05:00"
}
```

El vendedor se toma del token, nunca del cuerpo de la petición.

## Consultar Subastas

**Endpoint**

GET http://localhost:5000/api/v1/subastas?categoria=tecnologia&estado=ABIERTA&texto=laptop&pagina=1&tamano=12

## Consultar Detalle

**Endpoint** 

GET http://localhost:5000/api/v1/subastas/:id

Devuelve el estado, la oferta vigente, el historial de pujas y, solo al ganador o al vendedor, la orden de pago.

## Registrar Puja

**Endpoint** 

POST http://localhost:5000/api/v1/subastas/:id/pujas

**Body**
```json
{
  "valor": 1050000
}
```

Si la puja se rechaza, la API responde **422** con el código de la regla incumplida.

## Cancelar Subasta

**Endpoint** 

PATCH http://localhost:5000/api/v1/subastas/:id/cancelar

Permite al vendedor cancelar una subasta que aún no ha recibido pujas.

## Consultar Intentos Fallidos

**Endpoint** 

GET http://localhost:5000/api/v1/subastas/:id/intentos-fallidos

El vendedor ve todos los intentos rechazados de su subasta; los demás usuarios solo ven los suyos.

## Otros Recursos

| Método | Ruta | Descripción |
|---|---|---|
| GET | /categorias | Listar categorías |
| GET | /subastas/:id/pujas | Historial público de pujas |
| GET | /ordenes | Órdenes de pago del usuario ganador |
| GET  | /notificaciones | Notificaciones del usuario |
| PATCH  | /notificaciones/:id/leida | Marcar notificación como leída |
| POST | /webhooks/pagos | Webhook de la pasarela (se autentica con firma, no con token) |
| GET | /salud | Verificar que la API está en funcionamiento |

## Códigos de Respuesta

| Código | Situación |
|---|---|
| 200 / 201 / 204 | Operación exitosa |
| 400 | Formato inválido en la petición |
| 401 | Sin sesión, credenciales incorrectas o firma del webhook inválida |
| 403 | Acción no permitida (por ejemplo, cancelar la subasta de otro) |
| 404 | Recurso inexistente |
| 409 | Conflicto (correo repetido, cierre repetido, orden vencida) |
| 422 | Regla de negocio incumplida (por ejemplo, una puja rechazada) |
| 500 | Error interno no controlado |

Formato uniforme de error:
```json
{ "ok": false, "error": { "codigo": "RN-09", "mensaje": "La puja debe ser de al menos $1.100.000 ..." } }
```

---

# Casos de Uso Implementados

- RegistrarUsuario
- IniciarSesion
- ConsultarPerfil
- ListarCategorias
- PublicarSubasta
- ListarSubastas
- ConsultarDetalleSubasta
- CancelarSubasta
- RegistrarPuja
- ConsultarIntentosFallidos
- ConsultarOrdenesPago
- ProcesarEventoPago
- ConsultarNotificaciones
- MarcarNotificacionLeida

El cierre de subastas no es un caso de uso independiente: lo ejecuta `SincronizadorSubastas` de forma perezosa desde los casos de uso anteriores.

# Value Objects

## Dinero

Representa valores monetarios dentro del dominio.

Restricciones:

- Pesos colombianos.
- No permite valores negativos.
- No permite decimales.
- Es inmutable: sumar devuelve un nuevo objeto.

## Correo

Representa el correo electrónico de un usuario.

Restricciones:

- Debe tener un formato válido.
- Se normaliza en minúsculas y sin espacios, para garantizar la unicidad (RN-22).

## EstadoSubasta

Representa los posibles estados de una subasta:

- ABIERTA
- CANCELADA
- DESIERTA
- CERRADA (adjudicada, con orden de pago pendiente)
- PAGADA
- INCUMPLIDA

## EstadoPago

- PENDIENTE
- PAGADA
- VENCIDA

## Otros

- **EstadoConservacion:** NUEVO, COMO_NUEVO, BUEN_ESTADO, USADO, PARA_REPARAR.
- **ResultadoPago:** APROBADO, RECHAZADO.
- **TipoNotificacion:** PUJA_SUPERADA, SUBASTA_GANADA, SUBASTA_VENDIDA, SUBASTA_DESIERTA, PAGO_CONFIRMADO, PAGO_RECHAZADO, ORDEN_VENCIDA.

# Persistencia

La aplicación utiliza persistencia real mediante MongoDB Atlas.

Adaptadores:

- MongoSubastaRepository
- MongoUsuarioRepository
- MongoCategoriaRepository
- MongoEventoPagoRepository
- MongoNotificacionRepository

Tecnología utilizada:

- MongoDB Atlas
- Mongoose

Puertos:

- SubastaRepository
- UsuarioRepository
- CategoriaRepository
- EventoPagoRepository
- NotificacionRepository

Gracias a la Arquitectura Hexagonal, la implementación se elige en `contenedor.ts` con la variable `PERSISTENCIA`: `mongo` usa MongoDB y `memoria` usa los adaptadores en memoria. Ninguno de los dos cambia el dominio ni los casos de uso.

La persistencia permite almacenar:

- Usuarios (con la contraseña cifrada)
- Categorías
- Subastas con su artículo
- Pujas
- Intentos de puja fallidos
- Estados de subasta
- Ganadores
- Órdenes de pago
- Eventos de pago procesados
- Notificaciones

Las colecciones usan el prefijo `plataforma_`. Las colecciones de la entrega 2 no se reutilizan porque el modelo cambió.

---

# Comunicación en Tiempo Real

La aplicación utiliza Socket.IO para notificar cambios importantes a los clientes conectados.

Los eventos son emitidos a través del puerto:

NotificacionPort

e implementados mediante:

SocketIONotificacionAdapter

Esto permite mantener desacoplada la lógica de negocio de la tecnología de comunicación utilizada.

La conexión exige el token de sesión: `io(url, { auth: { token } })`. Cada usuario queda unido a una sala personal para recibir sus avisos.

## Eventos Implementados

### suscribirse-subasta / desuscribirse-subasta

El cliente se une o sale de la sala de una subasta específica.

### suscribirse-listado / desuscribirse-listado

El cliente recibe las novedades de todas las subastas para actualizar el listado.

### nueva-puja

Se emite a los suscritos cuando una puja válida es registrada. Incluye el nuevo valor vigente, el nombre del postor y el monto mínimo siguiente.

### notificacion

Se emite solo al usuario afectado. Por ejemplo `PUJA_SUPERADA` cuando alguien supera su oferta, o `SUBASTA_GANADA` al ganador.

### subasta-estado

Se emite cuando la subasta se cierra, se adjudica, se cancela, se paga o queda en incumplimiento. Incluye el resultado.

### participantes

Informa cuántas personas están conectadas a una subasta (RF-16).

## Recorrido de una Puja

1. El navegador envía `POST /subastas/:id/pujas` con el token.
2. El middleware de autenticación verifica el token y `SubastaController` valida el formato.
3. `RegistrarPuja` recupera la subasta, aplica el cierre perezoso y llama a `Subasta.registrarPuja()`.
4. Si el dominio la acepta, se guarda y `AvisadorNegocio` anuncia el hecho por `NotificacionPort`.
5. `SocketIONotificacionAdapter` emite `nueva-puja` a la sala de la subasta y `notificacion` al postor superado.
6. Los demás navegadores actualizan la oferta sin recargar la página.

Si el dominio la rechaza, la API responde 422 con el motivo y el intento queda registrado.

# Webhook de Pagos

La pasarela informa el resultado del cobro con:

POST http://localhost:5000/api/v1/webhooks/pagos

**Cabecera:** `x-pasarela-firma: sha256=<HMAC-SHA256 del cuerpo usando WEBHOOK_SECRET>`

**Body**
```json
{
  "eventoId": "evt_123",
  "ordenId": "orden-...",
  "resultado": "APROBADO"
}
```

Proceso:

1. Se verifica la firma antes de cualquier otra cosa. Si no es válida, se responde 401 sin cambiar nada (RN-18).
2. Si el `eventoId` ya fue procesado, se devuelve la misma respuesta guardada (RN-19).
3. Si es nuevo y legítimo, se actualizan la orden y la subasta, y se anuncia el resultado.

## Pasarela Simulada

`npm run pasarela` levanta un proceso independiente (puerto 5050) que hace el papel de la pasarela externa. Desde **Mis pagos** o el detalle de una subasta ganada, el botón **Pagar** abre su página de cobro, que permite:

- Aprobar o rechazar el pago.
- Reenviar el mismo evento, para demostrar RN-19.
- Enviar una firma inválida, para demostrar RN-18.

# Aplicación Web (Frontend)

Carpeta: `frontend-subastas`

Tecnología: Angular 22 con componentes *standalone* y *signals*, `HttpClient` con interceptor y `socket.io-client`.

Se eligió Angular porque su enrutador con guardas, la inyección de dependencias y los interceptores permiten resolver la sesión y el manejo de errores en un solo lugar.

Estructura:

```
frontend-subastas/src/app
├── compartido
│   ├── alerta-error        (.ts .html .css)
│   ├── avisos              (.ts .html .css)
│   ├── cuenta-regresiva    (.ts .html .css)
│   ├── estado-subasta      (.ts .html .css)
│   ├── imagen-articulo     (.ts .html .css)
│   ├── pipes/pesos.pipe.ts
│   └── servicios/reloj.service.ts
├── core
│   ├── guardas/sesion.guard.ts
│   ├── interceptores/autenticacion.interceptor.ts
│   ├── servicios (sesion, subastas, tiempo-real, notificaciones, avisos)
│   ├── errores.ts
│   └── modelos.ts
├── diseno
│   └── encabezado          (.ts .html .css)
├── paginas
│   ├── acceso              (.ts .html .css)
│   ├── listado             (.ts .html .css)
│   ├── detalle             (.ts .html .css)
│   ├── publicar            (.ts .html .css)
│   ├── perfil              (.ts .html .css)
│   └── ordenes             (.ts .html .css)
├── app.ts / app.html / app.css
├── app.config.ts
└── app.routes.ts
```

Responsabilidades:

- **core/servicios:** sesión con token guardado y control de expiración (RF-21), consumo de la API REST y conexión de WebSocket.
- **core/interceptores:** agregan el token a cada petición y cierran la sesión si expira.
- **core/guardas:** protegen las páginas que requieren sesión.
- **core/errores.ts:** traduce los errores de la API en mensajes comprensibles (RF-25).
- **compartido:** componentes reutilizables, cada uno en su carpeta con sus tres archivos.
- **paginas:** una carpeta por pantalla: acceso, listado con filtros y paginación (RF-22), detalle en tiempo real con formulario de puja (RF-23, RF-24), publicación, perfil y pagos.

Las direcciones de la API, del WebSocket y de la pasarela están en `frontend-subastas/src/environments/environment.ts`.

# Tecnologías Utilizadas

- Node.js
- TypeScript (modo estricto)
- Express.js
- MongoDB Atlas
- Mongoose
- Socket.IO
- JSON Web Tokens
- bcrypt
- Jest y Supertest
- Angular

# Middleware Global

La aplicación implementa middlewares globales en `src/infrastructure/http/middlewares`:

- **manejoErrores.ts:** captura las excepciones y devuelve respuestas HTTP con formato uniforme y el código de estado adecuado. Registra en consola los errores no controlados.
- **autenticacion.ts:** verifica el token `Bearer` antes de las rutas protegidas.

Además, `validaciones.ts` revisa el formato de los datos de entrada. Esa validación no reemplaza la del dominio.

# Variables de Entorno

El proyecto utiliza un archivo `.env`. El repositorio incluye `.env.example` con los nombres de las variables y sin valores reales.

Ejemplo:

```env
PORT=5000
PERSISTENCIA=mongo
MONGODB_URI=tu_cadena_de_conexion
JWT_SECRET=una_clave_larga_y_aleatoria
JWT_EXPIRACION=8h
WEBHOOK_SECRET=otra_clave_larga_y_aleatoria
CORS_ORIGENES=http://localhost:4200
SEMBRAR_DEMO=true
PASARELA_PUERTO=5050
PASARELA_API_URL=http://localhost:5000/api/v1
```

| Variable | Descripción |
|---|---|
| PORT | Puerto de la API REST y de WebSockets |
| PERSISTENCIA | `mongo` o `memoria` |
| MONGODB_URI | Cadena de conexión de MongoDB Atlas (obligatoria con `mongo`) |
| JWT_SECRET | Clave para firmar los tokens de sesión (obligatoria) |
| JWT_EXPIRACION | Vigencia del token |
| WEBHOOK_SECRET | Clave compartida con la pasarela para firmar el webhook (obligatoria) |
| CORS_ORIGENES | Orígenes del frontend permitidos |
| SEMBRAR_DEMO | `true` crea usuarios y subastas de demostración si no existen |
| PASARELA_PUERTO | Puerto de la pasarela simulada |
| PASARELA_API_URL | URL de la API a la que la pasarela envía el webhook |

El archivo `.env` no debe almacenarse en el repositorio.

---

# Instalación

1. Clonar el repositorio: git clone https://github.com/Eleanisareiza1/Electiva2_SubastasEnLinea_EleanisAreiza.git

2. Ingresar al proyecto: cd Electiva2_SubastasEnLinea_EleanisAreiza

3. Instalar dependencias de la API: npm install

4. Instalar dependencias del frontend: cd frontend-subastas && npm install

5. Crear el archivo de entorno: copiar `.env.example` como `.env` y completar los valores.

---

# Pruebas

Ejecutar en la raíz:

npm test

Se ejecutan 39 pruebas:

- `src/tests/domain`: reglas de publicación, aceptación y rechazo de pujas, cierre, adjudicación y pago.
- `src/tests/http`: códigos de estado, formato de error, auditoría de rechazos, filtros, cierre perezoso y webhook idempotente.

Frontend: cd frontend-subastas && npm test

# Compilación

npm run build

Frontend: cd frontend-subastas && npm run build

# Ejecución

Se necesitan tres terminales:

| Terminal | Comando | Dirección |
|---|---|---|
| API REST y WebSockets | npm run dev | http://localhost:5000/api/v1 |
| Pasarela simulada | npm run pasarela | http://localhost:5050/checkout |
| Aplicación web | cd frontend-subastas && npm start | http://localhost:4200 |

Con `SEMBRAR_DEMO=true` se crean los usuarios `valentina@demo.com`, `sofia@demo.com` y `mateo@demo.com` (contraseña `Demo12345`) y ocho subastas de ejemplo: una que cierra en pocos minutos, una ya adjudicada con orden de pago pendiente y una desierta.

En modo producción: npm run build y luego npm start.

# Estrategia de Ramas

El desarrollo del proyecto se realizó utilizando ramas de trabajo para aislar cambios antes de integrarlos a la rama principal.

Ramas:

- main: rama principal y estable. Es la que se califica en cada entrega.
- feat/persistencia-mongodb: persistencia con MongoDB Atlas, tiempo real, autenticación y pagos (entrega 2).
- feat/entrega-3-integracion-web: aplicación web, webhook terminado y completitud del dominio (entrega 3).

Cada rama se integra a `main` mediante un Pull Request en GitHub.

Esta estrategia permitió desarrollar nuevas características sin afectar la estabilidad de la aplicación.

# Convención de Commits

Se utilizan mensajes descriptivos siguiendo el formato:

tipo(alcance): descripción

feat: incorporación de nuevas funcionalidades
fix: corrección de errores
refactor: mejoras internas sin modificar comportamiento
test: pruebas
docs: actualización de documentación
chore: configuración y mantenimiento

Ejemplos:

feat(realtime): implementar persistencia y eventos en tiempo real
fix(domain): corregir reconstruccion de subastas desde mongodb
feat(frontend): redisenar la aplicacion web con sesion, tiempo real, pujas y pagos
refactor(frontend): organizar cada componente en su propia carpeta
docs: actualizar README para entrega 3

# Resumen de Reglas Implementadas
- RN-01
- RN-02
- RN-03
- RN-04
- RN-05
- RN-06
- RN-07
- RN-08
- RN-09
- RN-10
- RN-11
- RN-12
- RN-13
- RN-14
- RN-15
- RN-16
- RN-17
- RN-18
- RN-19
- RN-20
- RN-21
- RN-22
- RN-23
