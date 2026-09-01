"use strict";
//Estamos creando un caso de uso. El controlador delega la creación de subastas a este caso de uso. El caso de uso se encarga de crear la subasta y devolverla al controlador para que este la devuelva al cliente.
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrearSubasta = void 0;
const Subasta_1 = require("../domain/Subasta");
class CrearSubasta {
    ejecutar(datos) {
        const subasta = new Subasta_1.Subasta(datos.titulo, datos.precioBase, datos.incrementoMinimo, datos.fechaCierre);
        return subasta;
    }
}
exports.CrearSubasta = CrearSubasta;
//# sourceMappingURL=CrearSubasta.js.map