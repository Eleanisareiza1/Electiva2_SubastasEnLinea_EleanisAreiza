export class EventoPago {

    constructor(
        public readonly eventoId: string,
        public readonly ordenId: string,
        public readonly estado: string
    ) {}

}