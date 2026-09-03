"use strict";
// Representa una oferta realizada por un usuario
// dentro de una subasta.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Puja = void 0;
class Puja {
    constructor(usuarioId, valor) {
        this.usuarioId = usuarioId;
        this.valor = valor;
        this.fecha = new Date();
    }
}
exports.Puja = Puja;
//# sourceMappingURL=Puja.js.map