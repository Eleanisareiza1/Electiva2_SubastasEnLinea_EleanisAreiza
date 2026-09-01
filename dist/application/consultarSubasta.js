"use strict";
//Estamos creando un caso de uso para consultar todas las subastas disponibles en el repositorio.
// No dejamos que el controlador acceda directamente al repositorio, sino que delegamos la responsabilidad de obtener las subastas a este caso de uso.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultarSubastas = void 0;
class ConsultarSubastas {
    constructor(repository) {
        this.repository = repository;
    }
    ejecutar() {
        return this.repository.obtenerTodas();
    }
}
exports.ConsultarSubastas = ConsultarSubastas;
//# sourceMappingURL=ConsultarSubasta.js.map