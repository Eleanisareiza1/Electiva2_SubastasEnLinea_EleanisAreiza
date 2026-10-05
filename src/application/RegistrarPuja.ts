// Define un caso de uso encargado de registrar una puja en una subasta.

// Importa la interfaz del repositorio de subastas.
import { SubastaRepository } from "../domain/subastaRepository";

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
        // Recibe el repositorio que contiene las subastas.
        // "private" permite usarlo solo dentro de esta clase.
        // "readonly" impide reemplazarlo después de asignarlo.
        private readonly repository: SubastaRepository
    ) {}

    // Declara el método ejecutar.
    // Recibe los datos necesarios para registrar una puja.
    // No devuelve ningún valor.
    ejecutar(
        // Recibe un objeto con el índice, usuario y valor de la puja.
        datos: RegistrarPujaDTO
    ): void {

        // Muestra en la consola todas las subastas almacenadas.
        // Esta línea sirve para depuración y puede eliminarse posteriormente.
        console.log(this.repository.obtenerTodas());

        // Obtiene la subasta ubicada en el índice recibido.
        const subasta =
            this.repository.obtenerTodas()[
                // Utiliza el índice indicado en los datos.
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
    }
}

