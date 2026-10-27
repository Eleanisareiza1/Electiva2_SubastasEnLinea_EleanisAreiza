import { SubastaRepository }
from "../domain/subastaRepository";

interface CancelarSubastaDTO {

    indiceSubasta: number;

}

export class CancelarSubasta {

    constructor(
        private readonly repository:
        SubastaRepository
    ) {}

  async  ejecutar(
        datos: CancelarSubastaDTO
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

        subasta.cancelar();

    }

}