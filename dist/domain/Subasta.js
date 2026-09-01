"use strict";
//Aqui estasmos creamos una entidad capaz de protegerse sola.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subasta = void 0;
class Subasta {
    constructor(titulo, precioBase, incrementoMinimo, fechaCierre) {
        const fechaPublicacion = new Date();
        // RN-01 Toda subasta se publica con un precio base mayor que cero, un incremento mínimo mayor que cero y una fecha y hora de cierre
        if (precioBase <= 0) {
            throw new Error("RN-01: El precio base debe ser mayor que cero");
        }
        if (incrementoMinimo <= 0) {
            throw new Error("RN-01: El incremento mínimo debe ser mayor que cero");
        }
        // RN-02 La fecha de cierre debe ser posterior al momento de publicación.
        if (fechaCierre <= fechaPublicacion) {
            throw new Error("RN-02: La fecha de cierre debe ser posterior a la publicación");
        }
        const diferenciaHoras = (fechaCierre.getTime() - fechaPublicacion.getTime())
            / (1000 * 60 * 60);
        // RN-03 La duración de una subasta no puede ser inferior a una hora ni superior a treinta días.
        if (diferenciaHoras < 1) {
            throw new Error("RN-03: La duración mínima de una subasta es una hora");
        }
        if (diferenciaHoras > 720) {
            throw new Error("RN-03: La duración máxima de una subasta es de treinta días");
        }
        this.titulo = titulo;
        this.precioBase = precioBase;
        this.incrementoMinimo = incrementoMinimo;
        this.fechaPublicacion = fechaPublicacion;
        this.fechaCierre = fechaCierre;
    }
}
exports.Subasta = Subasta;
``;
//# sourceMappingURL=Subasta.js.map