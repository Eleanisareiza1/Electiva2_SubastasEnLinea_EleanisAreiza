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