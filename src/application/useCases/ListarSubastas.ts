import { SubastaRepository } from "../../domain/repositories/SubastaRepository";
import { EstadoSubasta } from "../../domain/valueObjects/EstadoSubasta";
import { ConstructorContexto } from "../services/ConstructorContexto";
import { SincronizadorSubastas } from "../services/SincronizadorSubastas";
import { SubastaResumenVista, aVistaResumen } from "../services/Vistas";

export interface ListarSubastasDTO {
    categoriaId?: string;
    estado?: EstadoSubasta;
    texto?: string;
    pagina: number;
    tamanoPagina: number;
}

export interface ListadoSubastas {
    items: SubastaResumenVista[];
    pagina: number;
    tamanoPagina: number;
    total: number;
    totalPaginas: number;
    conteoPorEstado: Record<string, number>;
}

// RF-05: listado con filtros por categoría y estado, y paginación.
export class ListarSubastas {

    constructor(
        private readonly subastas: SubastaRepository,
        private readonly sincronizador: SincronizadorSubastas,
        private readonly contexto: ConstructorContexto
    ) {}

    async ejecutar(filtros: ListarSubastasDTO): Promise<ListadoSubastas> {

        // Cierre perezoso antes de consultar, para que los estados estén al día.
        await this.sincronizador.sincronizarPendientes();

        const [pagina, conteoPorEstado] = await Promise.all([
            this.subastas.buscar(filtros),
            this.subastas.contarPorEstado(filtros.categoriaId)
        ]);

        const contexto = await this.contexto.construir(pagina.items);

        return {
            items: pagina.items.map((s) => aVistaResumen(s, contexto)),
            pagina: filtros.pagina,
            tamanoPagina: filtros.tamanoPagina,
            total: pagina.total,
            totalPaginas: Math.max(1, Math.ceil(pagina.total / filtros.tamanoPagina)),
            conteoPorEstado
        };
    }

}
