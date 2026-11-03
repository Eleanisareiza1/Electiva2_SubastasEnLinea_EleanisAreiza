import { SubastaRepository } from "../domain/subastaRepository";
import { NotificacionPort } from "./ports/NotificacionPort";

// Datos requeridos para localizar y cerrar una subasta.
interface CerrarSubastaDTO {

    indiceSubasta: number;

}

export class CerrarSubasta {

    constructor(
        private readonly repository: SubastaRepository,
        private readonly notificaciones: NotificacionPort
    ) {}

  // Cierra la subasta, guarda el estado resultante y notifica a los suscriptores.
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

        await this.repository.guardar(
            subasta
        );

        this.notificaciones
            .notificarSubastaCerrada(
                datos.indiceSubasta
            );

    }

}