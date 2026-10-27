// Define un caso de uso encargado de registrar una puja en una subasta.

// Importa la interfaz del repositorio de subastas.
import { SubastaRepository } from "../domain/subastaRepository";
import { NotificacionPort } from "./ports/NotificacionPort";

// Define los datos necesarios para registrar una puja.
interface RegistrarPujaDTO {

    // Indica la posición de la subasta dentro del arreglo.
    indiceSubasta: number;

    // Identifica al usuario que realiza la puja.
    usuarioId: string;

    // Indica el valor ofrecido en la puja.
    valor: number;
}

// Declara y exporta la clase RegistrarPuja.
export class RegistrarPuja {

    // Constructor de la clase.
    constructor(
    private readonly repository: SubastaRepository,
    private readonly notificaciones: NotificacionPort
    ) {}

    // Declara el método ejecutar.
    // Recibe los datos necesarios para registrar una puja.
    // No devuelve ningún valor.
   async  ejecutar(
        // Recibe un objeto con el índice, usuario y valor de la puja.
        datos: RegistrarPujaDTO
    ): Promise<void> {

        // Obtiene la subasta ubicada en el índice recibido.
        const subastas =
        await this.repository.obtenerTodas();

        const subasta =
            subastas[
                datos.indiceSubasta
            ];

        // Comprueba si la subasta no existe.
        if (!subasta) {

            // Detiene la ejecución y muestra un mensaje de error.
            throw new Error("Subasta no encontrada");
        }

        // Solicita a la entidad Subasta que registre la puja.
        // La entidad se encarga de validar las reglas de negocio.
        subasta.registrarPuja(
            // Envía el identificador del usuario.
            datos.usuarioId,

            // Envía el valor ofrecido.
            datos.valor
        );

        this.notificaciones
        .notificarNuevaPuja(
            datos.indiceSubasta,
            datos.valor
        );
    }
}

