import { SubastaRepository }
from "../domain/subastaRepository";

// Caso de uso que consulta los intentos de puja rechazados de una subasta concreta.
export class ConsultarIntentosFallidos {

    constructor(
        private readonly repository:
        SubastaRepository
    ) {}

  // Localiza la subasta por índice y devuelve el historial de intentos fallidos.
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