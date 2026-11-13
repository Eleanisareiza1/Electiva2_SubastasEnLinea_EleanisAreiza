# Plataforma de Subastas en Línea

**Asignatura:** Electiva II – Desarrollo de Software · **Programa:** Ingeniería de Software
**Equipo:** Equipo Ele · **Integrante:** Eleanis Areiza López

Plataforma donde un vendedor publica un artículo con precio base y fecha de cierre, los usuarios
registrados pujan en tiempo real y, al cerrar, la oferta más alta gana y genera una orden de pago
que confirma una pasarela externa mediante un webhook.

| Entrega | Contenido | Estado |
|---|---|---|
| 1 | Modelado del dominio y recursos de la API | ✔ |
| 2 | API completa, persistencia real (MongoDB) y tiempo real (Socket.IO) | ✔ |
| 3 | Aplicación web (Angular) integrada, webhook de pagos terminado | ✔ |

---

## 1. Ejecución rápida (desde cero)

Requisitos: **Node.js 20 o superior** y npm. MongoDB Atlas es opcional (ver `PERSISTENCIA`).

```bash
# 1. Clonar e instalar la API
git clone https://github.com/Eleanisareiza1/Electiva2_SubastasEnLinea_EleanisAreiza.git
cd Electiva2_SubastasEnLinea_EleanisAreiza
npm install

# 2. Configurar variables de entorno
cp .env.example .env        # en Windows: copy .env.example .env
#    completar JWT_SECRET, WEBHOOK_SECRET y MONGODB_URI (o PERSISTENCIA=memoria)

# 3. Instalar el frontend
cd frontend-subastas
npm install
cd ..
```

Se necesitan **tres terminales**:

| Terminal | Comando | Dirección |
|---|---|---|
| API REST + WebSockets | `npm run dev` | http://localhost:5000/api/v1 |
| Pasarela de pagos simulada | `npm run pasarela` | http://localhost:5050/checkout |
| Aplicación web | `cd frontend-subastas && npm start` | http://localhost:4200 |

Con `SEMBRAR_DEMO=true` la API crea al iniciar tres usuarios (`valentina@demo.com`, `sofia@demo.com`,
`mateo@demo.com`, contraseña `Demo12345`) y ocho subastas: una que cierra en pocos minutos, una ya
adjudicada con orden de pago pendiente y una desierta, para recorrer el ciclo completo en la sustentación.

Para compilar y ejecutar en modo producción: `npm run build && npm start`.

## 2. Variables de entorno

Todas se leen en `src/infrastructure/config/entorno.ts` (RNF-10). El archivo `.env.example` las lista sin valores reales.

| Variable | Obligatoria | Descripción |
|---|---|---|
| `PORT` | No (5000) | Puerto de la API REST y de WebSockets |
| `PERSISTENCIA` | No | `mongo` o `memoria`. Si se omite, usa `mongo` cuando hay `MONGODB_URI` |
| `MONGODB_URI` | Con `mongo` | Cadena de conexión de MongoDB Atlas |
| `JWT_SECRET` | Sí | Secreto para firmar los tokens de sesión |
| `JWT_EXPIRACION` | No (8h) | Vigencia del token |
| `WEBHOOK_SECRET` | Sí | Secreto compartido con la pasarela para firmar el webhook (HMAC-SHA256) |
| `CORS_ORIGENES` | No | Orígenes del frontend permitidos, separados por coma |
| `SEMBRAR_DEMO` | No (false) | `true` crea los datos de demostración si no existen |
| `PASARELA_PUERTO` | No (5050) | Puerto del simulador de la pasarela |
| `PASARELA_API_URL` | No | URL de la API a la que la pasarela envía el webhook |

> Con MongoDB se usan colecciones nuevas con prefijo `plataforma_` (las de la entrega 2 no se reutilizan porque el modelo cambió).

## 3. Pruebas

```bash
npm test            # 39 pruebas: dominio + API de punta a punta con persistencia en memoria
npm run typecheck   # verificación de tipos en modo estricto
```

- `src/tests/domain/` – reglas de publicación, aceptación y rechazo de pujas, cierre, adjudicación y pago (RNF-14).
- `src/tests/http/` – códigos HTTP, formato de error, auditoría de rechazos, filtros, cierre perezoso y webhook idempotente.

## 4. Arquitectura hexagonal

```
                ┌──────────────────────── infraestructura ────────────────────────┐
  Angular ──HTTP──▶ http/ (rutas, controladores, validación de formato, errores)   │
  Angular ◀──WS───  socket/ (SocketIONotificacionAdapter) ◀── NotificacionPort ─┐  │
  Pasarela ─HTTP──▶ http/controllers/WebhookController (verifica firma)         │  │
                │                     │                                         │  │
                │          ┌──────── aplicación ────────┐                       │  │
                │          │ casos de uso + servicios    │── puertos de salida ──┘  │
                │          │   ┌──── dominio ────┐       │                          │
                │          │   │ Subasta (raíz)  │       │── repositorios ──▶ repositories/
                │          │   │ reglas RN-01…23 │       │   (puertos)       mongo/ y memoria/
                │          │   └─────────────────┘       │                          │
                │          └─────────────────────────────┘                          │
                └────────────────────────────────────────────────────────────────────┘
```

| Carpeta | Capa | Responsabilidad |
|---|---|---|
| `src/domain/` | Dominio | Entidades, objetos de valor y **todas las reglas de negocio**. No importa Express, Socket.IO, Mongoose ni JWT (RNF-02). |
| `src/domain/valueObjects/` | Dominio | `Dinero`, `Correo` y los estados: inmutables y autovalidados (RNF-07). |
| `src/domain/repositories/` | Dominio | Puertos de persistencia (interfaces) (RNF-04). |
| `src/domain/errors/` | Dominio | `ErrorDominio` con código de regla y tipo, sin conocer HTTP. |
| `src/application/useCases/` | Aplicación | Un caso de uso por operación; orquesta: recupera el agregado, le pide actuar y guarda. |
| `src/application/ports/` | Aplicación | Puertos de salida: `NotificacionPort` (tiempo real), `CifradorContrasenas`, `GeneradorTokens`, `GeneradorIds`. |
| `src/application/services/` | Aplicación | Cierre perezoso (`SincronizadorSubastas`), avisos de negocio (`AvisadorNegocio`) y vistas sin datos de contacto. |
| `src/infrastructure/http/` | Infraestructura | Rutas por recurso, controladores sin reglas, validación de formato y manejo de errores. |
| `src/infrastructure/socket/` | Infraestructura | Servidor Socket.IO y adaptador del `NotificacionPort`. |
| `src/infrastructure/repositories/` | Infraestructura | Adaptadores `mongo/` y `memoria/` de los mismos puertos (RNF-06). |
| `src/infrastructure/auth/` | Infraestructura | bcrypt, JWT, UUID y firma HMAC del webhook. |
| `src/infrastructure/herramientas/` | Infraestructura | Datos de demostración y pasarela de pagos simulada. |
| `src/infrastructure/contenedor.ts` | Infraestructura | Raíz de composición: decide qué adaptador implementa cada puerto. |
| `frontend-subastas/` | Cliente | Aplicación Angular (ver sección 8). |
| `docs/openapi.yaml` | Documentación | Especificación OpenAPI de la API REST, eventos WebSocket y contrato del webhook. |

### Modelo de dominio

- **Raíz de agregado: `Subasta`.** La frontera de consistencia incluye `Articulo`, `Puja`, `IntentoPujaFallida`
  y `OrdenPago`: ninguno se modifica sin pasar por la subasta, por eso las reglas no se pueden saltar.
- **Entidades con identidad propia:** `Usuario`, `Categoria`, `Notificacion`, `EventoPago`.
- **Objetos de valor:** `Dinero` (COP, entero, no negativo), `Correo` (normalizado), `EstadoSubasta`,
  `EstadoPago`, `EstadoConservacion`, `ResultadoPago`, `TipoNotificacion`.
- **Concepto adicional:** `ErrorDominio`, para que cada rechazo lleve el código de la regla incumplida.

Estados de la subasta: `ABIERTA → CANCELADA` (sin pujas) · `ABIERTA → DESIERTA` (cierre sin pujas) ·
`ABIERTA → CERRADA` (adjudicada con orden pendiente) `→ PAGADA` (webhook aprobado) o `→ INCUMPLIDA` (orden vencida).

## 5. Dónde se cumple cada regla de negocio

| Regla | Lugar exacto |
|---|---|
| RN-01 precio base, incremento y cierre | `Subasta.publicar()` en `src/domain/Subasta.ts` |
| RN-02 no nace vencida | `Subasta.publicar()` |
| RN-03 entre 1 hora y 30 días | `Subasta.publicar()` (`DURACION_MINIMA_MS`, `DURACION_MAXIMA_MS`) |
| RN-04 cancelar solo sin pujas | `Subasta.cancelar()` |
| RN-05 datos inmutables | Propiedades `readonly` de `Subasta` y ausencia de métodos de modificación; `Dinero` inmutable |
| RN-06 solo subastas abiertas | `Subasta.registrarPuja()` |
| RN-07 el vendedor no puja | `Subasta.registrarPuja()` |
| RN-08 primera puja ≥ precio base | `Subasta.registrarPuja()` |
| RN-09 superar la vigente + incremento | `Subasta.registrarPuja()` |
| RN-10 no superarse a sí mismo | `Subasta.registrarPuja()` |
| RN-11 puja irrevocable | `Puja` (solo `readonly`); `Subasta.obtenerPujas()` devuelve una copia; no existe operación de retiro |
| RN-12 auditoría de rechazos | `Subasta.rechazar()` + `RegistrarPuja` guarda la subasta también cuando se rechaza |
| RN-13 adjudicación al mejor postor | `Subasta.cerrar()` |
| RN-14 desierta sin pago | `Subasta.cerrar()` |
| RN-15 orden por 48 horas | `OrdenPago.emitir()` en `src/domain/OrdenPago.ts` |
| RN-16 un solo cierre | `Subasta.cerrar()` y `Subasta.verificarCierre()` |
| RN-17 pago solo por la pasarela | `Subasta.registrarResultadoPago()` (único camino a `OrdenPago.confirmarPago()`) |
| RN-18 verificar origen | `firmaValida()` en `src/infrastructure/auth/FirmaPasarela.ts`, usada por `WebhookController` antes de todo |
| RN-19 idempotencia | `ProcesarEventoPago` + `EventoPagoRepository` (guarda la respuesta y la repite) |
| RN-20 orden vencida → incumplimiento | `Subasta.verificarVencimientoPago()` |
| RN-21 pesos sin decimales, no negativos | `Dinero` en `src/domain/valueObjects/Dinero.ts` |
| RN-22 correo único | `RegistrarUsuario` + índice único en `MongoUsuarioRepository` |
| RN-23 historial público sin contacto | `aVistaDetalle()` en `src/application/services/Vistas.ts` (solo id y nombre del postor) |

**Cierre perezoso (sección 4.4):** `SincronizadorSubastas` se ejecuta al listar, consultar el detalle,
pujar, cancelar y consultar órdenes; no hay procesos en segundo plano.

## 6. Comunicación

| Canal | Quién inicia | Implementación |
|---|---|---|
| API REST | La aplicación web | `src/infrastructure/http/rutas.ts` |
| WebSockets | El servidor | `ServidorTiempoReal.ts` + `SocketIONotificacionAdapter` (puerto `NotificacionPort`) |
| Webhook | La pasarela | `POST /api/v1/webhooks/pagos` con cabecera `x-pasarela-firma` |

**Recorrido de una puja:** el navegador envía `POST /subastas/:id/pujas` → `autenticacion` verifica el token →
`SubastaController.pujar` valida el formato → `RegistrarPuja` recupera la subasta, aplica el cierre perezoso y
llama a `Subasta.registrarPuja()` → si la acepta, se guarda y `AvisadorNegocio` anuncia el hecho por
`NotificacionPort` → `SocketIONotificacionAdapter` emite `nueva-puja` a la sala `subasta:<id>` y `notificacion`
a la sala personal del postor superado → los demás navegadores actualizan la oferta sin recargar.
Si la rechaza, la API responde **422** con el código de la regla y el intento queda auditado.

Documentación completa de recursos, eventos y contrato del webhook: **`docs/openapi.yaml`**
(se puede abrir en https://editor.swagger.io).

## 7. Pasarela de pagos simulada

`npm run pasarela` levanta un proceso independiente que representa al tercero. Desde **Mis pagos** o el
detalle de una subasta ganada, el botón **Pagar** abre su página de cobro, donde se puede:

- **Aprobar** o **Rechazar** → envía el webhook firmado con `WEBHOOK_SECRET`.
- **Reenviar el mismo evento** → demuestra RN-19: misma respuesta, ningún cambio adicional.
- **Enviar con firma inválida** → demuestra RN-18: la API responde 401 y no cambia nada.

## 8. Aplicación web (`frontend-subastas/`)

Angular 22 con componentes *standalone* y *signals*, `HttpClient` con interceptor y `socket.io-client`.
Se eligió Angular por su enrutador con guardas, inyección de dependencias e interceptores, que resuelven
la sesión y el manejo de errores en un solo lugar.

| Carpeta | Responsabilidad |
|---|---|
| `src/app/core/servicios/` | Sesión (token guardado y expiración), API REST, WebSocket, notificaciones y avisos |
| `src/app/core/interceptores/` | Agrega el token a cada petición y cierra la sesión si expira |
| `src/app/core/guardas/` | Protege las rutas privadas |
| `src/app/core/errores.ts` | Traduce los errores de la API a mensajes comprensibles (RF-25) |
| `src/app/compartido/` | Cuenta regresiva, insignia de estado, imagen por categoría, alertas y formato de pesos |
| `src/app/diseno/` | Encabezado con búsqueda, indicador en vivo, notificaciones y menú de usuario |
| `src/app/paginas/` | Acceso, listado (filtros, paginación, actividad), detalle en tiempo real, publicar, perfil y pagos |

Comandos: `npm start` (desarrollo), `npm run build` (producción). Las direcciones de la API, del WebSocket y
de la pasarela están en `src/environments/environment.ts`.

## 9. Estrategia de ramas y convención de commits

- `main`: rama estable; es la que se califica en cada entrega y siempre debe compilar.
- `feat/<tema>`: una rama por funcionalidad (`feat/persistencia-mongodb`, `feat/entrega-3-integracion-web`).
- Integración a `main` mediante *Pull Request* en GitHub.

Mensajes con el formato **Conventional Commits** en español: `tipo(alcance): descripción en infinitivo`.

| Tipo | Uso |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de un error |
| `refactor` | Cambio interno sin alterar el comportamiento |
| `test` | Pruebas |
| `docs` | Documentación |
| `chore` | Configuración y mantenimiento |

Ejemplos: `feat(dominio): agregar articulo y categoria al agregado subasta`,
`fix(api): responder 422 cuando una puja incumple una regla`, `docs: documentar el webhook en openapi`.

## 10. Tecnologías

Node.js · TypeScript (modo estricto) · Express 5 · Socket.IO · MongoDB Atlas con Mongoose · JWT · bcrypt ·
Jest y Supertest · Angular 22.
