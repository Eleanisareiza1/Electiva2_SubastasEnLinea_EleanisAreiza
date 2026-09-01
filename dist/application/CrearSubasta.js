"use strict";
//Estamos implementando un caso de uso para crear una subasta. Este caso de uso recibe los datos necesarios para crear una subasta, crea una instancia de la entidad Subasta y la guarda en el repositorio.
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrearSubasta = void 0;
const Subasta_1 = require("../domain/Subasta");
class CrearSubasta {
    constructor(repository) {
        this.repository = repository;
    }
    ejecutar(datos) {
        const subasta = new Subasta_1.Subasta(datos.titulo, datos.precioBase, datos.incrementoMinimo, datos.fechaCierre);
        this.repository.guardar(subasta);
        return subasta;
    }
}
exports.CrearSubasta = CrearSubasta;
//# sourceMappingURL=CrearSubasta.js.map