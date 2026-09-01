"use strict";
//Estamos creando un repositorio de subastas en memoria y exportándolo para que pueda ser utilizado en otras partes de la aplicación.
Object.defineProperty(exports, "__esModule", { value: true });
exports.subastaRepository = void 0;
const InMemorySubastaRepository_1 = require("./InMemorySubastaRepository");
exports.subastaRepository = new InMemorySubastaRepository_1.InMemorySubastaRepository();
//# sourceMappingURL=repositories.js.map