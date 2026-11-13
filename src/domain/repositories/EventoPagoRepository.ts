import { EventoPago } from "../EventoPago";

// Puerto para registrar los eventos de pago ya procesados (idempotencia, RN-19).
export interface EventoPagoRepository {

    buscarPorId(eventoId: string): Promise<EventoPago | null>;

    guardar(evento: EventoPago): Promise<void>;

}
