// Define una entidad de dominio que representa una subasta.
// La entidad contiene sus propios datos y reglas de negocio.

// Importa la clase Puja para registrar las ofertas realizadas.
import { Puja } from "./Puja";

// Declara y exporta la clase Subasta para usarla desde otros archivos.
export class Subasta {

    // Título o nombre de la subasta.
    public readonly titulo: string;

    // Precio mínimo con el que inicia la subasta.
    public readonly precioBase: number;

    // Valor mínimo que debe aumentar cada nueva puja.
    public readonly incrementoMinimo: number;

    // Fecha y hora en la que se crea la subasta.
    public readonly fechaPublicacion: Date;

    // Fecha y hora en la que finaliza la subasta.
    public readonly fechaCierre: Date;

    // Lista privada de pujas realizadas en la subasta.
    // "private" impide modificarla directamente desde fuera de la clase.
    private pujas: Puja[] = [];

    // Constructor que recibe los datos necesarios para crear una subasta.
    constructor(
        // Recibe el título de la subasta.
        titulo: string,

        // Recibe el precio base de la subasta.
        precioBase: number,

        // Recibe el incremento mínimo de cada puja.
        incrementoMinimo: number,

        // Recibe la fecha y hora de cierre.
        fechaCierre: Date
    ) {

        // Obtiene la fecha y hora actual como fecha de publicación.
        const fechaPublicacion = new Date();

        // RN-01: valida que el precio base sea mayor que cero.
        if (precioBase <= 0) {

            // Detiene la creación y muestra un mensaje de error.
            throw new Error(
                "RN-01: El precio base debe ser mayor que cero"
            );
        }

        // RN-01: valida que el incremento mínimo sea mayor que cero.
        if (incrementoMinimo <= 0) {

            // Detiene la creación si el incremento no es válido.
            throw new Error(
                "RN-01: El incremento mínimo debe ser mayor que cero"
            );
        }

        // RN-02: valida que el cierre ocurra después de la publicación.
        if (fechaCierre <= fechaPublicacion) {

            // Detiene la creación si la fecha de cierre no es válida.
            throw new Error(
                "RN-02: La fecha de cierre debe ser posterior a la publicación"
            );
        }

        // Calcula la duración de la subasta en horas.
        const diferenciaHoras =
            (fechaCierre.getTime() - fechaPublicacion.getTime())
            / (1000 * 60 * 60);

        // RN-03: valida que dure al menos una hora.
        if (diferenciaHoras < 1) {

            // Detiene la creación si la duración es demasiado corta.
            throw new Error(
                "RN-03: La duración mínima de una subasta es una hora"
            );
        }

        // RN-03: valida que no dure más de treinta días.
        // Setecientas veinte horas equivalen a treinta días.
        if (diferenciaHoras > 720) {

            // Detiene la creación si la duración es demasiado larga.
            throw new Error(
                "RN-03: La duración máxima de una subasta es de treinta días"
            );
        }

        // Guarda el título validado en la propiedad de la clase.
        this.titulo = titulo;

        // Guarda el precio base validado.
        this.precioBase = precioBase;

        // Guarda el incremento mínimo validado.
        this.incrementoMinimo = incrementoMinimo;

        // Guarda la fecha actual como fecha de publicación.
        this.fechaPublicacion = fechaPublicacion;

        // Guarda la fecha de cierre validada.
        this.fechaCierre = fechaCierre;
    }

    // Registra una nueva puja dentro de la subasta.
    registrarPuja(
        // Identificador del usuario que realiza la puja.
        usuarioId: string,

        // Valor ofrecido por el usuario.
        valor: number
    ): void {

        // Obtiene la última puja registrada.
        const ultimaPuja =
            this.pujas[this.pujas.length - 1];

        // RN-08: valida la primera puja de la subasta.
        if (!ultimaPuja) {

            // La primera puja debe ser igual o superior al precio base.
            if (valor < this.precioBase) {

                // Rechaza la puja si es menor al precio base.
                throw new Error(
                    "RN-08: La primera puja debe ser mayor o igual al precio base"
                );
            }
        }

        // RN-09: valida las pujas posteriores a la primera.
        if (ultimaPuja) {

            // Calcula el valor mínimo permitido para la nueva puja.
            const valorMinimo =
                ultimaPuja.valor +
                this.incrementoMinimo;

            // Comprueba que la nueva puja cumpla el incremento mínimo.
            if (valor < valorMinimo) {

                // Rechaza la puja si no supera el valor mínimo.
                throw new Error(
                    "RN-09: La puja debe superar la oferta vigente más el incremento mínimo"
                );
            }
        }

        // RN-10: impide que un usuario supere su propia puja vigente.
        if (
            ultimaPuja &&
            ultimaPuja.usuarioId === usuarioId
        ) {

            // Rechaza la puja del mismo usuario consecutivamente.
            throw new Error(
                "RN-10: No puede superar su propia puja vigente"
            );
        }

        // Crea una nueva instancia de Puja con el usuario y el valor.
        const nuevaPuja =
            new Puja(usuarioId, valor);

        // Agrega la nueva puja al listado de pujas.
        this.pujas.push(nuevaPuja);
    }

// Cierra la definición de la clase Subasta.
}
