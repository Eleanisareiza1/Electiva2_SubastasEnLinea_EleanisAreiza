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
---

## Descripción del Proyecto

La Plataforma de Subastas en Línea permite la publicación y gestión de subastas, el registro de pujas por parte de los usuarios y la difusión de eventos en tiempo real mediante WebSockets.

El sistema fue construido siguiendo los principios de Arquitectura Hexagonal, manteniendo el dominio desacoplado de los mecanismos de persistencia, transporte y comunicación.

Actualmente la aplicación ofrece:

- Creación de subastas.
- Consulta de subastas.
- Registro de pujas.
- Cancelación de subastas.
- Cierre de subastas.
- Persistencia real mediante MongoDB Atlas.
- Comunicación en tiempo real mediante Socket.IO.
- Notificaciones de nuevas pujas.
- Notificaciones de usuarios superados.
- Middleware global para manejo de errores.
- Consulta de intentos de puja fallidos.
- Generación de órdenes de pago para el ganador.

---

# Arquitectura Utilizada

El proyecto está organizado siguiendo el modelo de Arquitectura Hexagonal.

La intención principal es mantener las reglas del negocio independientes de frameworks, librerías externas, mecanismos de persistencia y detalles de infraestructura.

## Correspondencia con Arquitectura Hexagonal

| Carpeta | Capa |
|----------|----------|
| domain | Dominio |
| application | Aplicación |
| infrastructure | Infraestructura |

## Capas implementadas

### Domain

Contiene las entidades, puertos y reglas de negocio.

Archivos:

Subasta.ts
Puja.ts
OrdenPago.ts
IntentoPujaFallida.ts
subastaRepository.ts

valueObjects/
├── Dinero.ts
└── EstadoSubasta.ts

Responsabilidades:

- Contener las reglas de negocio.
- Garantizar la consistencia del dominio.
- Definir los contratos necesarios para acceder a la persistencia.
- Permanecer independiente de Express, bases de datos o infraestructura.

---

### Application

Contiene los casos de uso.

Ruta:src/application
Archivos:

CrearSubasta.ts
ConsultarSubasta.ts
ConsultarIntentosFallidos.ts
RegistrarPuja.ts
CancelarSubasta.ts
CerrarSubasta.ts

ports/
└── NotificacionPort.ts


Responsabilidades:

- Coordinar la ejecución del dominio.
- Utilizar los puertos definidos en el dominio.
- Orquestar las operaciones del sistema.
- Mantenerse independiente de HTTP y de los detalles de la infraestructura.

---

### Infrastructure

Contiene los adaptadores de entrada y salida.

Ruta:src/infrastructure
Archivos:

controllers/
├── SubastaController.ts

repositories/
├── mongodb.ts
├── MongoSubastaRepository.ts
├── repositories.ts
└── SubastaModel.ts

middlewares/
└── errorHandler.ts

routes/
└── subastaRoutes.ts

socket/
├── socketServer.ts
└── SocketIONotificacionAdapter.ts

Responsabilidades:

- Recibir solicitudes HTTP.
- Exponer la API REST.
- Implementar repositorios concretos.
- Conectar la aplicación con el mundo exterior.

---

# Estructura del Proyecto


src
│
├── application
│   ├── ports
│   │   └── NotificacionPort.ts
│   │
│   ├── CrearSubasta.ts
│   ├── ConsultarSubasta.ts
│   ├── ConsultarIntentosFallidos.ts
│   ├── RegistrarPuja.ts
│   ├── CancelarSubasta.ts
│   └── CerrarSubasta.ts
│
├── domain
│   ├── valueObjects
│   │   ├── Dinero.ts
│   │   └── EstadoSubasta.ts
│   │
│   ├── Subasta.ts
│   ├── Puja.ts
│   ├── OrdenPago.ts
│   ├── IntentoPujaFallida.ts
│   └── subastaRepository.ts
│
├── infrastructure
│   ├── controllers
│   │   └── SubastaController.ts
│   │
│   ├── middlewares
│   │   └── errorHandler.ts
│   │
│   ├── repositories
│   │   ├── mongodb.ts
│   │   ├── MongoSubastaRepository.ts
│   │   ├── repositories.ts
│   │   └── SubastaModel.ts
│   │
│   ├── routes
│   │   └── subastaRoutes.ts
│   │
│   └── socket
│       ├── socketServer.ts
│       └── SocketIONotificacionAdapter.ts
│
├── tests
│
├── app.ts
└── server.ts


---

# Reglas de Negocio Implementadas

## Publicación de Subastas

### RN-01
Toda subasta debe tener:
- Precio base mayor que cero.
- Incremento mínimo mayor que cero.

### RN-02

La fecha de cierre debe ser posterior a la fecha de publicación.

### RN-03
La duración de la subasta debe ser:
- Mínimo una hora.
- Máximo treinta días.

---

## Gestión de Subasta

## RN-04
No se puede cancelar una subasta que ya haya recibido pujas.

## RN-05
No se pueden registrar pujas en una subasta cancelada.

## RN-13
Una subasta solo puede cerrarse cuando ha llegado su fecha de cierre.

## RN-14
El ganador únicamente puede determinarse cuando la subasta ha sido cerrada.

## RN-16
Una subasta no puede cerrarse más de una vez.

## Gestión de Pujas

## RN-07
El vendedor no puede pujar sobre su propia subasta. 

### RN-08
La primera puja debe ser mayor o igual al precio base de la subasta.

### RN-09
Toda puja posterior debe superar la oferta vigente más el incremento mínimo definido para la subasta.

### RN-10
Un usuario no puede superar su propia puja cuando ya es el mejor postor de la subasta.

---

## Reglas Monetarias

## RN-21
Los valores monetarios:
- No pueden ser negativos.
- No pueden contener valores decimales

# Recursos de la API

## Crear Subasta

**Endpoint**
POST http://localhost:5000/api/v1/subastas

**Body**
json
{
  "titulo": "Laptop Gamer",
  "precioBase": 1000000,
  "incrementoMinimo": 50000,
  "fechaCierre": "2026-09-15T12:00:00"
}

---

## Consultar Subastas

**Endpoint**
GET http://localhost:5000/api/v1/subastas

---

## Registrar Puja

**Endpoint**
POST http://localhost:5000/api/v1/subastas/:indice/pujas


**Body**
json
{
  "usuarioId": "usuario1",
  "valor": 1000000
}


## Cancelar Subasta

**Endpoint**

PATCH http://localhost:5000/api/v1/subastas/:indice/cancelar

Permite cancelar una subasta que aún no ha recibido pujas.

## Cerrar Subasta

**Endpoint**

PATCH http://localhost:5000/api/v1/subastas/:indice/cerrar

Permite cerrar una subasta cuando se cumplen las condiciones definidas por las reglas del negocio.

## Consultar Intentos Fallidos

**Endpoint**

GET /api/v1/subastas/:indice/intentos-fallidos

Permite consultar los intentos de puja rechazados y sus motivos.



---
# Casos de Uso Implementados

- CrearSubasta
- ConsultarSubasta
- ConsultarIntentosFallidos
- RegistrarPuja
- CancelarSubasta
- CerrarSubasta


# Value Objects

## Dinero

Representa valores monetarios dentro del dominio.

Restricciones:

- No permite valores negativos.
- No permite decimales.

## EstadoSubasta

Representa los posibles estados de una subasta:

- ABIERTA
- CANCELADA
- CERRADA
- DESIERTA


# Persistencia

La aplicación utiliza persistencia real mediante MongoDB Atlas.

Adaptador:

MongoSubastaRepository

Tecnología utilizada:

- MongoDB Atlas
- Mongoose

Puerto:

SubastaRepository

Gracias a la Arquitectura Hexagonal fue posible sustituir la implementación inicial en memoria por MongoDB sin modificar las entidades del dominio ni los casos de uso.

La persistencia permite almacenar:

- Subastas
- Pujas
- Intentos de puja fallidos
- Estados de subasta
- Ganadores
- Órdenes de pago
---
# Comunicación en Tiempo Real

La aplicación utiliza Socket.IO para notificar cambios importantes a los clientes conectados.

Los eventos son emitidos a través del puerto:

NotificacionPort

e implementados mediante:

SocketIONotificacionAdapter

Esto permite mantener desacoplada la lógica de negocio de la tecnología de comunicación utilizada.

## Eventos Implementados

### suscribirse-subasta

Permite que un cliente se una a la sala de una subasta específica.

### nueva-puja

Se emite cuando una puja válida es registrada correctamente.

### usuario-superado

Se emite cuando un usuario deja de ser el líder de una subasta.

### subasta-cerrada

Se emite cuando una subasta pasa al estado cerrada.

# Tecnologías Utilizadas

- Node.js
- TypeScript
- Express.js
- MongoDB Atlas
- Mongoose
- Socket.IO
- Jest

# Middleware Global 

La aplicación implementa un middleware global para el manejo centralizado de errores. 

Archivo: errorHandler.ts 

Su responsabilidad es capturar excepciones de la aplicación y devolver respuestas HTTP consistentes al cliente.

# Variables de Entorno

El proyecto utiliza un archivo '.env'.

Ejemplo:

```env
PORT=5000
MONGODB_URI=tu_cadena_de_conexion
```
El archivo `.env` no debe almacenarse en el repositorio.

---
# Instalación

1. Clonar el repositorio: git clone URL_DEL_REPOSITORIO


2. Ingresar al proyecto: cd Electiva2_SubastasEnLinea_EleanisAreiza


3. Instalar dependencias: npm install


---

# Pruebas

Ejecutar:
npm test


# Compilación
npm run build


# Ejecución

Iniciar la aplicación: npm run dev

Servidor disponible en: http://localhost:5000

# Resumen de Reglas Implementadas
- RN-01
- RN-02
- RN-03
- RN-04
- RN-05
- RN-07
- RN-08
- RN-09
- RN-10
- RN-13
- RN-14
- RN-16
- RN-21




