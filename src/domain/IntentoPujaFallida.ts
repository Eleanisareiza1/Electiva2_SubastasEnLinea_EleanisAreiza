// Registra una puja rechazada, el usuario responsable, el motivo y la fecha del intento.
export class IntentoPujaFallida {

    public readonly usuarioId: string;

    public readonly motivo: string;

    public readonly fecha: Date;

    constructor(
        usuarioId: string,
        motivo: string
    ) {

        this.usuarioId = usuarioId;

        this.motivo = motivo;

        this.fecha = new Date();

    }

}