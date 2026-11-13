import { SubastaRepository } from "../../domain/repositories/SubastaRepository";
import { SincronizadorSubastas } from "../services/SincronizadorSubastas";
import { OrdenPagoVista, aVistaOrden } from "../services/Vistas";

// RF-17: el ganador consulta sus órdenes de pago.
export class ConsultarOrdenesPago {

    constructor(
        private readonly subastas: SubastaRepository,
        private readonly sincronizador: SincronizadorSubastas
    ) {}

    async ejecutar(ganadorId: string): Promise<OrdenPagoVista[]> {

        // Cierre y vencimiento perezosos antes de mostrar las órdenes.
        await this.sincronizador.sincronizarPendientes();

        const ganadas = await this.subastas.buscarPorGanador(ganadorId);

        return ganadas
            .map((subasta) => {
                const orden = subasta.obtenerOrdenPago();
                return orden ? aVistaOrden(orden, subasta.articulo.nombre) : null;
            })
            .filter((orden): orden is OrdenPagoVista => orden !== null)
            .sort((a, b) => b.fechaEmision.localeCompare(a.fechaEmision));
    }

}
