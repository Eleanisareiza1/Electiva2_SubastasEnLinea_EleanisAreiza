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

    ejecutar(
        datos: CerrarSubastaDTO
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

        subasta.cerrar();

    }

}