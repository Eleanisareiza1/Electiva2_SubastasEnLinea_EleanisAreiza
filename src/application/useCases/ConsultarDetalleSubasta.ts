import { Subasta } from "../../domain/Subasta";
import { ErrorDominio } from "../../domain/errors/ErrorDominio";
import { SubastaRepository } from "../../domain/repositories/SubastaRepository";
import { ConstructorContexto } from "../services/ConstructorContexto";
import { SincronizadorSubastas } from "../services/SincronizadorSubastas";
import { SubastaDetalleVista, aVistaDetalle } from "../services/Vistas";

export async function buscarSubastaOFallar(
    subastas: SubastaRepository,
    id: string
): Promise<Subasta> {

    const subasta = await subastas.buscarPorId(id);

    if (!subasta) {
        throw new ErrorDominio(
            "SUBASTA_NO_ENCONTRADA",
            "La subasta solicitada no existe",
            "NO_ENCONTRADO"
        );
    }

    return subasta;
}

// RF-06: detalle con estado, oferta vigente e historial de pujas (RN-23: público).
export class ConsultarDetalleSubasta {

    constructor(
        private readonly subastas: SubastaRepository,
        private readonly sincronizador: SincronizadorSubastas,
        private readonly contexto: ConstructorContexto
    ) {}

    async ejecutar(subastaId: string, usuarioActualId: string): Promise<SubastaDetalleVista> {

        const subasta = await buscarSubastaOFallar(this.subastas, subastaId);

        // Cierre perezoso al consultar (sección 4.4).
        await this.sincronizador.sincronizar(subasta);

        return aVistaDetalle(subasta, await this.contexto.construir([subasta]), usuarioActualId);
    }

}
