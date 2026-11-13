import { Request, Response } from "express";
import { aResultadoPago } from "../../../domain/valueObjects/ResultadoPago";
import { CABECERA_FIRMA, firmaValida } from "../../auth/FirmaPasarela";
import { CasosDeUso } from "../../contenedor";
import { LectorCuerpo } from "../validaciones";

// Cuerpo crudo guardado por express.json para verificar la firma.
export interface SolicitudConCuerpoCrudo extends Request {
    cuerpoCrudo?: Buffer;
}

// Webhook: un tercero (la pasarela) informa al servidor sin que este pregunte.
export function crearWebhookController(casos: CasosDeUso, secreto: string) {
    return {

        async recibirPago(request: SolicitudConCuerpoCrudo, response: Response): Promise<void> {

            // RN-18: primero se verifica el origen; si falla no se toca nada.
            const firma = request.header(CABECERA_FIRMA);

            if (!request.cuerpoCrudo || !firmaValida(request.cuerpoCrudo, firma, secreto)) {
                console.warn("[webhook] Notificación rechazada: firma inválida o ausente");
                response.status(401).json({
                    ok: false,
                    error: { codigo: "RN-18", mensaje: "No fue posible verificar el origen de la notificación" }
                });
                return;
            }

            const cuerpo = new LectorCuerpo(request.body);
            const eventoId = cuerpo.texto("eventoId", { max: 100 });
            const ordenId = cuerpo.texto("ordenId", { max: 100 });
            const resultado = cuerpo.texto("resultado");
            cuerpo.verificar();

            // RN-19: la respuesta es idéntica en cada reenvío del mismo evento.
            const respuesta = await casos.procesarEventoPago.ejecutar({
                eventoId,
                ordenId,
                resultado: aResultadoPago(resultado)
            });

            response.status(200).json({ ok: true, data: respuesta });
        }

    };
}
