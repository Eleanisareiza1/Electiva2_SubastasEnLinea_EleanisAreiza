import { Subasta } from "../Subasta";
import { EstadoSubasta } from "../valueObjects/EstadoSubasta";

export interface FiltrosSubasta {
    categoriaId?: string;
    estado?: EstadoSubasta;
    texto?: string;
    pagina: number;
    tamanoPagina: number;
}

export interface PaginaSubastas {
    items: Subasta[];
    total: number;
}

// Puerto de persistencia del agregado Subasta (RNF-04). Las implementaciones
// concretas (memoria y MongoDB) viven en infraestructura (RNF-06).
export interface SubastaRepository {

    guardar(subasta: Subasta): Promise<void>;

    buscarPorId(id: string): Promise<Subasta | null>;

    buscarPorOrdenPagoId(ordenId: string): Promise<Subasta | null>;

    // Listado con filtros por categoría, estado y texto, ordenado por cierre y paginado.
    buscar(filtros: FiltrosSubasta): Promise<PaginaSubastas>;

    contarPorEstado(categoriaId?: string): Promise<Record<string, number>>;

    // Subastas abiertas con el plazo vencido o adjudicadas con la orden vencida:
    // las que necesitan sincronizar su estado de forma perezosa.
    buscarPendientesDeSincronizar(ahora: Date): Promise<Subasta[]>;

    buscarPorVendedor(vendedorId: string): Promise<Subasta[]>;

    buscarPorParticipante(postorId: string): Promise<Subasta[]>;

    buscarPorGanador(ganadorId: string): Promise<Subasta[]>;

}
