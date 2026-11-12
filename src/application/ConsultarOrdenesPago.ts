import { SubastaRepository }
from "../domain/subastaRepository";

export class ConsultarOrdenesPago {

    constructor(
        private readonly repository:
        SubastaRepository
    ) {}

    async ejecutar(
        ganadorId: string
    ) {

        const subastas =
            await this.repository
            .obtenerTodas();

        return subastas.filter(
            (subasta) =>
                subasta.obtenerGanadorId() ===
                ganadorId &&
                subasta.obtenerOrdenPago()
        );

    }

}