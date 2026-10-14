export class OrdenPago {

    constructor(
        public readonly ganadorId: string,
        public readonly valor: number,
        public readonly fechaLimite: Date
    ) {}

}