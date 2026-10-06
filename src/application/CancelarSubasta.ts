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

    ejecutar(
        datos: CancelarSubastaDTO
    ): void {

        const subasta =
            this.repository.obtenerTodas()[
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