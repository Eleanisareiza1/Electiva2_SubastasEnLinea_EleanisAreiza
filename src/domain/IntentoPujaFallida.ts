// Registro de auditoría de una puja rechazada y su causa (RN-12).
export class IntentoPujaFallida {

    constructor(
        public readonly postorId: string,
        public readonly valorOfrecido: number,
        public readonly codigoRegla: string,
        public readonly motivo: string,
        public readonly fecha: Date
    ) {}

}
