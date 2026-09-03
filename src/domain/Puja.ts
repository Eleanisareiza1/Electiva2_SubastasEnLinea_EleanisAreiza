// Representa una oferta realizada por un usuario
// dentro de una subasta.

export class Puja {

    public readonly usuarioId: string;
    public readonly valor: number;
    public readonly fecha: Date;

    constructor(
        usuarioId: string,
        valor: number
    ) {

        this.usuarioId = usuarioId;
        this.valor = valor;
        this.fecha = new Date();

    }

}