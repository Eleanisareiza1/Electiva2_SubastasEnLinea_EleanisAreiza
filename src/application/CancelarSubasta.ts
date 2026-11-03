import { SubastaRepository }
from "../domain/subastaRepository";

// Datos necesarios para identificar la subasta que se desea cancelar.
interface CancelarSubastaDTO {

    indiceSubasta: number;

}

export class CancelarSubasta {

    constructor(
        private readonly repository:
        SubastaRepository
    ) {}

  // Recupera la subasta y delega la regla de cancelación a la entidad.
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