// Caso de uso que valida y persiste una puja, y notifica los cambios relevantes.

// Importa la interfaz del repositorio de subastas.
import { SubastaRepository } from "../domain/subastaRepository";
import { NotificacionPort } from "./ports/NotificacionPort";

// Datos de entrada necesarios para localizar la subasta y registrar una oferta.
interface RegistrarPujaDTO {

    // Posición de la subasta en la colección devuelta por el repositorio.
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

    // Registra la oferta aceptada y emite eventos si cambian el liderazgo o la puja.
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
        
        // Conserva el liderazgo previo para detectar si otro usuario fue superado.
        const liderAnterior = subasta.obtenerUltimaPuja();
        // Solicita a la entidad Subasta que registre la puja.
        // La entidad valida las reglas de negocio antes de aceptar la oferta.
       

        subasta.registrarPuja(
            // Envía el identificador del usuario.
            datos.usuarioId,
            // Envía el valor ofrecido.
            datos.valor
        );
        await this.repository.guardar(
            subasta
        );
        // Si el liderazgo cambió, notifica al usuario cuya oferta dejó de ser la mayor.
        if (
            liderAnterior &&
            liderAnterior.usuarioId !==
            datos.usuarioId
        ) {

            // Publica la oferta registrada a los clientes suscritos a esta subasta.
            this.notificaciones
                .notificarUsuarioSuperado(
                    datos.indiceSubasta,
                    liderAnterior.usuarioId
                );

            

        }

        this.notificaciones
        .notificarNuevaPuja(
            datos.indiceSubasta,
            datos.valor
        );
    }
}
