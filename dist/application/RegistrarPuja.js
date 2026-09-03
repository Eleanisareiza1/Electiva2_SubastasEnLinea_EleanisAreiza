"use strict";
//Aqui estamos creando un caso de uso que se encarga de registrar una puja en una subasta.
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrarPuja = void 0;
class RegistrarPuja {
    constructor(repository) {
        this.repository = repository;
    }
    ejecutar(datos) {
        console.log(this.repository.obtenerTodas());
        const subasta = this.repository.obtenerTodas()[datos.indiceSubasta];
        if (!subasta) {
            throw new Error("Subasta no encontrada");
        }
        subasta.registrarPuja(datos.usuarioId, datos.valor);
    }
}
exports.RegistrarPuja = RegistrarPuja;
//# sourceMappingURL=RegistrarPuja.js.map