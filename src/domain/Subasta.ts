// Define una entidad de dominio que representa una subasta.
// La entidad contiene sus propios datos y reglas de negocio.

// Importa la clase Puja para registrar las ofertas realizadas.
import { Puja } from "./Puja";
import { Dinero } from "./valueObjects/Dinero";
import { EstadoSubasta } from "./valueObjects/EstadoSubasta";
import { IntentoPujaFallida } from "./IntentoPujaFallida";
import { OrdenPago } from "./OrdenPago";



// Declara y exporta la clase Subasta para usarla desde otros archivos.
export class Subasta {

    // Título o nombre de la subasta.
    public readonly titulo: string;

    public readonly vendedorId: string;
    // Precio mínimo con el que inicia la subasta.
    public readonly precioBase: Dinero;

    // Valor mínimo que debe aumentar cada nueva puja.
    public readonly incrementoMinimo: Dinero;

    // Fecha y hora en la que se crea la subasta.
    public readonly fechaPublicacion: Date;

    // Fecha y hora en la que finaliza la subasta.
    public readonly fechaCierre: Date;

    private estado: EstadoSubasta;
    // Lista privada de pujas realizadas en la subasta.
    // "private" impide modificarla directamente desde fuera de la clase.
    private pujas: Puja[] = [];
    private intentosFallidos: IntentoPujaFallida[] = [];
    private ganadorId: string | null = null;
    private ordenPago: OrdenPago | null = null;

    // Constructor que recibe los datos necesarios para crear una subasta.
    constructor(
        // Recibe el título de la subasta.
        titulo: string,
        vendedorId: string,

        // Recibe el precio base de la subasta.
        precioBase: Dinero,

        // Recibe el incremento mínimo de cada puja.
        incrementoMinimo: Dinero,

        // Recibe la fecha y hora de cierre.
        fechaCierre: Date,

    ) {

        // Obtiene la fecha y hora actual como fecha de publicación.
        const fechaPublicacion = new Date();

        // RN-01: valida que el precio base sea mayor que cero.
        if (precioBase.obtenerValor() <= 0) {

            // Detiene la creación y muestra un mensaje de error.
            throw new Error(
                "RN-01: El precio base debe ser mayor que cero"
            );
        }

        // RN-01: valida que el incremento mínimo sea mayor que cero.
        if (incrementoMinimo.obtenerValor() <= 0) {

            // Detiene la creación si el incremento no es válido.
            throw new Error(
                "RN-01: El incremento mínimo debe ser mayor que cero"
            );
        }


        // RN-02: valida que el cierre ocurra después de la publicación.
        if (fechaCierre <= fechaPublicacion) {

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
        this.vendedorId = vendedorId;
        // Guarda el precio base validado.
        this.precioBase = precioBase;

        // Guarda el incremento mínimo validado.
        this.incrementoMinimo = incrementoMinimo;

        // Guarda la fecha actual como fecha de publicación.
        this.fechaPublicacion = fechaPublicacion;

        // Guarda la fecha de cierre validada.
        this.fechaCierre = fechaCierre;

        this.estado = EstadoSubasta.ABIERTA;
        
    }
  
    static reconstruir(
    titulo: string,
    vendedorId: string,
    precioBase: Dinero,
    incrementoMinimo: Dinero,
    fechaPublicacion: Date,
    fechaCierre: Date,
    estado: EstadoSubasta,
    pujas: Puja[] = []
    ): Subasta {

        const subasta =
            Object.create(
                Subasta.prototype
            ) as Subasta;

        Object.assign(
            subasta,
            {
                titulo,
                vendedorId,
                precioBase,
                incrementoMinimo,
                fechaPublicacion,
                fechaCierre,
                estado,
                pujas,
                intentosFallidos: [],
                ganadorId: null,
                ordenPago: null
            }
        );

        return subasta;
    }



    // Registra una nueva puja dentro de la subasta.
    registrarPuja(
    // Identificador del usuario que realiza la puja.
        usuarioId: string,

        // Valor ofrecido por el usuario.
        valor: number
    ): void {
        if (
            this.estado ===
            EstadoSubasta.CANCELADA
        ) {

            this.registrarIntentoFallido(
                usuarioId,
                "RN-05: No se pueden registrar pujas en una subasta cancelada"
            );

            throw new Error(
                "RN-05: No se pueden registrar pujas en una subasta cancelada"
            );

    }
        if (
        usuarioId === this.vendedorId
    ) {

        this.registrarIntentoFallido(
            usuarioId,
            "RN-07: El vendedor no puede pujar en su propia subasta"
        );

        throw new Error(
            "RN-07: El vendedor no puede pujar en su propia subasta"
        );

    }
        // Obtiene la última puja registrada.
        const ultimaPuja =
            this.pujas[this.pujas.length - 1];

        // RN-08: valida la primera puja de la subasta.
        if (!ultimaPuja) {

            // La primera puja debe ser igual o superior al precio base.
            if (valor < this.precioBase.obtenerValor()) {

                this.registrarIntentoFallido(
                    usuarioId,
                    "RN-08: La primera puja debe ser mayor o igual al precio base"
                );

                throw new Error(
                    "RN-08: La primera puja debe ser mayor o igual al precio base"
                );

            }
        }

        // RN-09: valida las pujas posteriores a la primera.
        if (ultimaPuja) {

            const valorMinimo =
                ultimaPuja.valor.sumar(
                    this.incrementoMinimo
                );

            if (
                valor <
                valorMinimo.obtenerValor()
            ) {

                this.registrarIntentoFallido(
                    usuarioId,
                    "RN-09: La puja debe superar la oferta vigente más el incremento mínimo"
                );

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
            this.registrarIntentoFallido(
                usuarioId,
                "RN-10: No puede superar su propia puja vigente"
            );

            throw new Error(
             "RN-10: No puede superar su propia puja vigente"
            );
        }

        // Crea una nueva instancia de Puja con el usuario y el valor.
        const nuevaPuja =
            new Puja(
                usuarioId,
                new Dinero(valor)
            );
        // Agrega la nueva puja al listado de pujas.
        this.pujas.push(nuevaPuja);
    }

    obtenerEstado(): EstadoSubasta {
    return this.estado;
    }

    obtenerIntentosFallidos(): IntentoPujaFallida[] {

    return this.intentosFallidos;

    }

    obtenerGanador(): Puja | null {

    if (
        this.estado !==
        EstadoSubasta.CERRADA
    ) {

        throw new Error(
            "RN-14: La subasta debe estar cerrada"
        );

    }

    if (
        this.pujas.length === 0
    ) {

        return null;

    }

    return this.pujas[
        this.pujas.length - 1
    ];

    }

    obtenerUltimaPuja(): Puja | null {

        if (
            this.pujas.length === 0
        ) {

            return null;

        }

        return this.pujas[
            this.pujas.length - 1
        ];

    }

    obtenerPujas(): Puja[] {

    return this.pujas;

    }

    obtenerGanadorId(): string | null {

    return this.ganadorId;

    }

    obtenerOrdenPago():OrdenPago | null {
    return this.ordenPago;
    }

    cancelar(): void {

    if (this.pujas.length > 0) {

        throw new Error(
            "RN-04: No se puede cancelar una subasta que ya recibió pujas"
        );

    }

    this.estado =
        EstadoSubasta.CANCELADA;

    }

    cerrar(): void {

    if (
        this.estado === EstadoSubasta.CERRADA ||
        this.estado === EstadoSubasta.DESIERTA
    ) {

        throw new Error(
            "RN-16: La subasta ya fue cerrada"
        );

    }

    const ahora =
        new Date();

    if (
        ahora < this.fechaCierre
    ) {

        throw new Error(
            "RN-13: La subasta aún no ha llegado a su fecha de cierre"
        );

    }

    if (
        this.estado ===
        EstadoSubasta.CANCELADA
    ) {

        throw new Error(
            "RN-13: No puede cerrarse una subasta cancelada"
        );

    }

    if (
        this.pujas.length === 0
    ) {

        this.estado =
            EstadoSubasta.DESIERTA;

        return;

    }

    const pujaGanadora =
        this.pujas[
            this.pujas.length - 1
        ];

    this.ganadorId =
        pujaGanadora.usuarioId;

    const fechaLimite =
        new Date();

    fechaLimite.setHours(
        fechaLimite.getHours() + 48
    );

    this.ordenPago =
        new OrdenPago(
            pujaGanadora.usuarioId,
            pujaGanadora.valor.obtenerValor(),
            fechaLimite
        );

    this.estado =
        EstadoSubasta.CERRADA;

    }

    private registrarIntentoFallido(
        usuarioId: string,
        motivo: string
    ): void {

    this.intentosFallidos.push(
        new IntentoPujaFallida(
            usuarioId,
            motivo
        )
    );

    
    }

}
