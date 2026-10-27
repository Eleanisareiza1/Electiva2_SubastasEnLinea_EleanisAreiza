import { SubastaRepository }
from "../domain/subastaRepository";

interface CerrarSubastaDTO {

    indiceSubasta: number;

}

export class CerrarSubasta {

    constructor(
        private readonly repository:
        SubastaRepository
    ) {}

  async  ejecutar(
        datos: CerrarSubastaDTO
    ): Promise<void> {

        const subastas =
    await this.repository.obtenerTodas();

        const subasta =
            subastas[
                datos.indiceSubasta
            ];

        if (!subasta) {

            throw new Error(
                "Subasta no encontrada"
            );

        }

        subasta.cerrar();

    }

}