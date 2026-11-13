import { SubastaRepository } from "../../domain/repositories/SubastaRepository";
import { AvisadorNegocio } from "../services/AvisadorNegocio";
import { SincronizadorSubastas } from "../services/SincronizadorSubastas";
import { buscarSubastaOFallar } from "./ConsultarDetalleSubasta";

// RF-07: el vendedor cancela una subasta sin pujas (RN-04, decidido por la entidad).
export class CancelarSubasta {

    constructor(
        private readonly subastas: SubastaRepository,
        private readonly sincronizador: SincronizadorSubastas,
        private readonly avisador: AvisadorNegocio
    ) {}

    async ejecutar(subastaId: string, solicitanteId: string): Promise<void> {

        const subasta = await buscarSubastaOFallar(this.subastas, subastaId);

        await this.sincronizador.sincronizar(subasta);

        subasta.cancelar(solicitanteId);

        await this.subastas.guardar(subasta);

        console.log(`[negocio] Subasta cancelada: ${subasta.id}`);

        await this.avisador.subastaCancelada(subasta);
    }

}
