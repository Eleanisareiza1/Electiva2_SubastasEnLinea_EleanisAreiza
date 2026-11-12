import { EventoPago } from "../domain/EventoPago";
import {yaProcesado,registrarEvento}from "../infrastructure/repositories/EventosProcesadosRepository";

export class ProcesarEventoPago {

    async ejecutar(
        evento: EventoPago
    ): Promise<void> {
        
        if (
            yaProcesado(
                evento.eventoId
            )
        ) {

            return;

        }

        registrarEvento(
            evento.eventoId
        );
     }

}