//Aqui estasmos creamos una entidad capaz de protegerse sola.
import { Puja } from "./Puja";


export class Subasta {

    public readonly titulo: string;
    public readonly precioBase: number;
    public readonly incrementoMinimo: number;
    public readonly fechaPublicacion: Date;
    public readonly fechaCierre: Date;
    private pujas: Puja[] = [];

    constructor(
        titulo: string,
        precioBase: number,
        incrementoMinimo: number,
        fechaCierre: Date
    ) {

        const fechaPublicacion = new Date();

        // RN-01 Toda subasta se publica con un precio base mayor que cero, un incremento mínimo mayor que cero y una fecha y hora de cierre
        if (precioBase <= 0) {
            throw new Error(
                "RN-01: El precio base debe ser mayor que cero"
            );
        }

        if (incrementoMinimo <= 0) {
            throw new Error(
                "RN-01: El incremento mínimo debe ser mayor que cero"
            );
        }

        // RN-02 La fecha de cierre debe ser posterior al momento de publicación.

        if (fechaCierre <= fechaPublicacion) {
            throw new Error(
                "RN-02: La fecha de cierre debe ser posterior a la publicación"
            );
        }

        const diferenciaHoras =
            (fechaCierre.getTime() - fechaPublicacion.getTime())
            / (1000 * 60 * 60);

        // RN-03 La duración de una subasta no puede ser inferior a una hora ni superior a treinta días.
        if (diferenciaHoras < 1) {
            throw new Error(
                "RN-03: La duración mínima de una subasta es una hora"
            );
        }

        if (diferenciaHoras > 720) {
            throw new Error(
                "RN-03: La duración máxima de una subasta es de treinta días"
            );
        }

        this.titulo = titulo;
        this.precioBase = precioBase;
        this.incrementoMinimo = incrementoMinimo;
        this.fechaPublicacion = fechaPublicacion;
        this.fechaCierre = fechaCierre;
    }

    registrarPuja(
    usuarioId: string,
    valor: number
): void {

    const ultimaPuja =
        this.pujas[this.pujas.length - 1];

    // RN-08
    if (!ultimaPuja) {

        if (valor < this.precioBase) {
            throw new Error(
                "RN-08: La primera puja debe ser mayor o igual al precio base"
            );
        }

    }

    // RN-09
    if (ultimaPuja) {

        const valorMinimo =
            ultimaPuja.valor +
            this.incrementoMinimo;

        if (valor < valorMinimo) {

            throw new Error(
                "RN-09: La puja debe superar la oferta vigente más el incremento mínimo"
            );

        }

    }

    // RN-10
    if (
        ultimaPuja &&
        ultimaPuja.usuarioId === usuarioId
    ) {

        throw new Error(
            "RN-10: No puede superar su propia puja vigente"
        );

    }

    const nuevaPuja =
        new Puja(usuarioId, valor);

    this.pujas.push(nuevaPuja);

}
}
