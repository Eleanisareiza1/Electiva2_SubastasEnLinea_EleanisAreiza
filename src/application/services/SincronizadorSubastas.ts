// Evaluación perezosa del cierre (sección 4.4) y del vencimiento de la orden
// de pago (RN-20). Se invoca cada vez que una subasta se consulta o recibe una
// puja; no existe un proceso programado en segundo plano.

import { Subasta } from "../../domain/Subasta";
import { SubastaRepository } from "../../domain/repositories/SubastaRepository";
import { AvisadorNegocio } from "./AvisadorNegocio";

export class SincronizadorSubastas {

    constructor(
        private readonly subastas: SubastaRepository,
        private readonly avisador: AvisadorNegocio
    ) {}

    // Devuelve true si la subasta cambió de estado.
    async sincronizar(subasta: Subasta, ahora: Date = new Date()): Promise<boolean> {

        const cerrada = subasta.verificarCierre(ahora);
        const vencida = subasta.verificarVencimientoPago(ahora);

        if (!cerrada && !vencida) {
            return false;
        }

        await this.subastas.guardar(subasta);

        if (cerrada) {
            await this.avisador.subastaCerrada(subasta);
        }

        if (vencida) {
            await this.avisador.ordenVencida(subasta);
        }

        return true;
    }

    // Sincroniza todas las que lo necesiten antes de un listado.
    async sincronizarPendientes(ahora: Date = new Date()): Promise<void> {

        const pendientes = await this.subastas.buscarPendientesDeSincronizar(ahora);

        for (const subasta of pendientes) {
            await this.sincronizar(subasta, ahora);
        }
    }

}
