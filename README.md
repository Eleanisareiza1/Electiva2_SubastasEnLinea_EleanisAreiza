# Plataforma de Subastas en Línea

## Información General

**Asignatura:** Electiva II - Desarrollo de Software

**Programa:** Ingeniería de Software

**Proyecto:** Plataforma de Subastas en Línea

**Equipo:** Equipo Ele

**Integrante:** - Eleanis Areiza López

# Estado Académico
Entrega 1: Modelado del dominio y recursos iniciales de la API en desarrollo.

---

## Descripción del Proyecto

La Plataforma de Subastas en Línea permite publicar artículos para ser ofertados por usuarios registrados mediante un mecanismo de subasta.
Actualmente el proyecto implementa la primera fase del sistema, enfocada en el modelado del dominio y en los recursos principales de la API.
Las reglas de negocio son ejecutadas dentro del dominio siguiendo los principios de Arquitectura Hexagonal, garantizando que el modelo de negocio permanezca independiente de la infraestructura y de los mecanismos de entrega HTTP.

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

Ruta: src/domain
Archivos:
Subasta.ts
Puja.ts
subastaRepository.ts

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
RegistrarPuja.ts


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
controllers
repositories
routes


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
│   ├── ConsultarSubasta.ts
│   ├── CrearSubasta.ts
│   └── RegistrarPuja.ts
│
├── domain
│   ├── Puja.ts
│   ├── Subasta.ts
│   └── subastaRepository.ts
│
├── infrastructure
│   ├── controllers
│   │   └── SubastaController.ts
│   │
│   ├── repositories
│   │   ├── InMemorySubastaRepository.ts
│   │   └── repositories.ts
│   │
│   └── routes
│       └── subastaRoutes.ts
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

## Gestión de Pujas

### RN-08
La primera puja debe ser mayor o igual al precio base de la subasta.

### RN-09
Toda puja posterior debe superar la oferta vigente más el incremento mínimo definido para la subasta.

### RN-10
Un usuario no puede superar su propia puja cuando ya es el mejor postor de la subasta.

---

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

---
# Casos de Uso Implementados

- CrearSubasta
- ConsultarSubastas
- RegistrarPuja

# Persistencia

La primera entrega utiliza persistencia en memoria mediante la implementación:

Adaptador :InMemorySubastaRepository

Esta implementación se encuentra detrás del puerto:

Puerto : SubastaRepository 

Gracias a este diseño es posible reemplazar la persistencia por una base de datos real sin modificar la capa de dominio ni los casos de uso.

---

# Tecnologías Utilizadas

- Node.js
- Express.js
- TypeScript

---

# Instalación

1. Clonar el repositorio: git clone URL_DEL_REPOSITORIO


2. Ingresar al proyecto: cd Electiva2_SubastasEnLinea_EleanisAreiza


3. Instalar dependencias: npm install


---

# Compilación
npm run build

# Ejecución

Iniciar la aplicación: npm run dev

Servidor disponible en: http://localhost:5000

# Reglas de Negocio Implementadas

- RN-01
- RN-02
- RN-03
- RN-08
- RN-09
- RN-10




