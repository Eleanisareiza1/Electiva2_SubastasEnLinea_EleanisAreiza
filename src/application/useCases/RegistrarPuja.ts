import { ErrorDominio } from "../../domain/errors/ErrorDominio";
import { SubastaRepository } from "../../domain/repositories/SubastaRepository";
import { AvisadorNegocio } from "../services/AvisadorNegocio";
import { SincronizadorSubastas } from "../services/SincronizadorSubastas";
import { buscarSubastaOFallar } from "./ConsultarDetalleSubasta";

export interface RegistrarPujaDTO {
    subastaId: string;
    postorId: string;
    valor: number;
}

export interface PujaRegistrada {
    subastaId: string;
    valor: number;
    fecha: string;
    montoMinimoSiguiente: number;
}

// RF-09 y RF-10. El caso de uso recupera la subasta y le pide que reciba la
// puja: es el modelo de dominio, y no el controlador, quien decide.
export class RegistrarPuja {

    constructor(
        private readonly subastas: SubastaRepository,
        private readonly sincronizador: SincronizadorSubastas,
        private readonly avisador: AvisadorNegocio
    ) {}

    async ejecutar(datos: RegistrarPujaDTO): Promise<PujaRegistrada> {

        const subasta = await buscarSubastaOFallar(this.subastas, datos.subastaId);

        // Cierre perezoso: si el plazo ya pasó, la subasta se cierra antes de evaluar la puja.
        await this.sincronizador.sincronizar(subasta);

        let aceptada;
        try {
            aceptada = subasta.registrarPuja(datos.postorId, datos.valor);
        } catch (error) {
            if (error instanceof ErrorDominio) {
                // RF-11 / RN-12: se conserva el intento rechazado con su motivo.
                await this.subastas.guardar(subasta);
                console.log(
                    `[negocio] Puja rechazada en ${subasta.id}: ${error.codigo} ${error.message}`
                );
            }
            throw error;
        }

        await this.subastas.guardar(subasta);

        console.log(
            `[negocio] Puja aceptada en ${subasta.id}: $${aceptada.puja.valor.obtenerValor()}`
        );

        // Se anuncia el hecho por el puerto de salida; el caso de uso no conoce WebSockets.
        await this.avisador.nuevaPuja(subasta, aceptada);

        return {
            subastaId: subasta.id,
            valor: aceptada.puja.valor.obtenerValor(),
            fecha: aceptada.puja.fecha.toISOString(),
            montoMinimoSiguiente: subasta.montoMinimoSiguiente()
        };
    }

}
