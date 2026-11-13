import { ResultadoPago } from "./valueObjects/ResultadoPago";

// Respuesta que la plataforma dio al procesar el evento. Se guarda para
// responder de forma idéntica si la pasarela reenvía el mismo evento (RN-19).
export interface RespuestaEventoPago {
    eventoId: string;
    ordenId: string;
    procesado: boolean;
    estadoOrden: string | null;
    mensaje: string;
}

// Notificación recibida desde la pasarela externa con el resultado de un cobro.
export class EventoPago {

    constructor(
        public readonly id: string,
        public readonly ordenId: string,
        public readonly resultado: ResultadoPago,
        public readonly fechaRecepcion: Date,
        public readonly respuesta: RespuestaEventoPago
    ) {}

}
