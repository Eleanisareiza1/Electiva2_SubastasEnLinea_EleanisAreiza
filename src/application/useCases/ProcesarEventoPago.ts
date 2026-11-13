import { EventoPago, RespuestaEventoPago } from "../../domain/EventoPago";
import { ErrorDominio } from "../../domain/errors/ErrorDominio";
import { EventoPagoRepository } from "../../domain/repositories/EventoPagoRepository";
import { SubastaRepository } from "../../domain/repositories/SubastaRepository";
import { ResultadoPago } from "../../domain/valueObjects/ResultadoPago";
import { AvisadorNegocio } from "../services/AvisadorNegocio";

export interface EventoPagoDTO {
    eventoId: string;
    ordenId: string;
    resultado: ResultadoPago;
}

// RF-18 a RF-20. Se ejecuta solo después de que la infraestructura verificó
// la firma de la pasarela (RN-18). Procesa cada evento una sola vez (RN-19).
export class ProcesarEventoPago {

    constructor(
        private readonly subastas: SubastaRepository,
        private readonly eventos: EventoPagoRepository,
        private readonly avisador: AvisadorNegocio
    ) {}

    async ejecutar(datos: EventoPagoDTO): Promise<RespuestaEventoPago> {

        // RN-19: un evento repetido recibe exactamente la misma respuesta y no cambia nada.
        const previo = await this.eventos.buscarPorId(datos.eventoId);

        if (previo) {
            console.log(`[negocio] Evento de pago repetido ignorado: ${datos.eventoId}`);
            return previo.respuesta;
        }

        const subasta = await this.subastas.buscarPorOrdenPagoId(datos.ordenId);

        if (!subasta) {
            throw new ErrorDominio(
                "ORDEN_NO_ENCONTRADA",
                "La orden de pago indicada no existe",
                "NO_ENCONTRADO"
            );
        }

        const ahora = new Date();
        const estadoPrevio = subasta.obtenerEstado();
        let respuesta: RespuestaEventoPago;
        let cambioEstado = false;

        try {
            cambioEstado = subasta.registrarResultadoPago(datos.resultado, ahora);

            respuesta = {
                eventoId: datos.eventoId,
                ordenId: datos.ordenId,
                procesado: true,
                estadoOrden: subasta.obtenerOrdenPago()?.obtenerEstado() ?? null,
                mensaje: datos.resultado === ResultadoPago.APROBADO
                    ? "Pago confirmado"
                    : "Cobro rechazado por la pasarela; la orden sigue pendiente"
            };
        } catch (error) {
            if (!(error instanceof ErrorDominio)) {
                throw error;
            }
            // Por ejemplo RN-20: la orden ya venció. Se responde sin cambiar el pago.
            respuesta = {
                eventoId: datos.eventoId,
                ordenId: datos.ordenId,
                procesado: false,
                estadoOrden: subasta.obtenerOrdenPago()?.obtenerEstado() ?? null,
                mensaje: `${error.codigo}: ${error.message}`
            };
        }

        const vencioAhora = estadoPrevio !== subasta.obtenerEstado() && !cambioEstado;

        if (cambioEstado || vencioAhora) {
            await this.subastas.guardar(subasta);
        }

        await this.eventos.guardar(
            new EventoPago(datos.eventoId, datos.ordenId, datos.resultado, ahora, respuesta)
        );

        console.log(`[negocio] Evento de pago ${datos.eventoId} (${datos.resultado}): ${respuesta.mensaje}`);

        if (cambioEstado) {
            await this.avisador.pagoConfirmado(subasta);
        } else if (vencioAhora) {
            await this.avisador.ordenVencida(subasta);
        } else if (respuesta.procesado && datos.resultado === ResultadoPago.RECHAZADO) {
            await this.avisador.pagoRechazado(subasta);
        }

        return respuesta;
    }

}
