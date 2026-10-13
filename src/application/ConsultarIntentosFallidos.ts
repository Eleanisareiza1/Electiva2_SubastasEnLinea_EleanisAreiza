import { SubastaRepository }
from "../domain/subastaRepository";

export class ConsultarIntentosFallidos {

    constructor(
        private readonly repository:
        SubastaRepository
    ) {}

    ejecutar(
        indiceSubasta: number
    ) {

        const subasta =
            this.repository.obtenerTodas()[
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