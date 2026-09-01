"use strict";
//Estamos implementando un repositorio en memoria para almacenar subastas. Este repositorio implementa la interfaz SubastaRepository y proporciona métodos para guardar y obtener subastas.
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemorySubastaRepository = void 0;
class InMemorySubastaRepository {
    constructor() {
        this.subastas = [];
    }
    guardar(subasta) {
        this.subastas.push(subasta);
    }
    obtenerTodas() {
        return this.subastas;
    }
}
exports.InMemorySubastaRepository = InMemorySubastaRepository;
//# sourceMappingURL=InMemorySubastaRepository.js.map