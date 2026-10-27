import { SubastaRepository }
from "../domain/subastaRepository";

export class ConsultarIntentosFallidos {

    constructor(
        private readonly repository:
        SubastaRepository
    ) {}

  async  ejecutar(
        indiceSubasta: number
    ) {

        const subastas =
    await this.repository.obtenerTodas();

        const subasta =
            subastas[
                indiceSubasta
            ];

        if (!subasta) {

            throw new Error(
                "Subasta no encontrada"
            );

        }

        return subasta
            .obtenerIntentosFallidos();

    }

}