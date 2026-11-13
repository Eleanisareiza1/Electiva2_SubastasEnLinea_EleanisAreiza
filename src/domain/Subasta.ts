// Raíz del agregado. Toda regla de publicación, pujas, cierre, adjudicación y
// pago se hace cumplir aquí, sin importar por qué camino llegue la solicitud.
// Dentro de la frontera de consistencia viven: Articulo, Puja,
// IntentoPujaFallida y OrdenPago.

import { Articulo } from "./Articulo";
import { ErrorDominio } from "./errors/ErrorDominio";
import { IntentoPujaFallida } from "./IntentoPujaFallida";
import { OrdenPago } from "./OrdenPago";
import { Puja } from "./Puja";
import { Dinero } from "./valueObjects/Dinero";
import { EstadoPago } from "./valueObjects/EstadoPago";
import { EstadoSubasta } from "./valueObjects/EstadoSubasta";
import { ResultadoPago } from "./valueObjects/ResultadoPago";

const UNA_HORA_MS = 60 * 60 * 1000;
export const DURACION_MINIMA_MS = UNA_HORA_MS;           // RN-03
export const DURACION_MAXIMA_MS = 30 * 24 * UNA_HORA_MS; // RN-03

// Resultado de una puja aceptada: permite a la aplicación saber a quién avisar.
export interface PujaAceptada {
    puja: Puja;
    postorSuperadoId: string | null;
}

export interface DatosSubasta {
    id: string;
    vendedorId: string;
    articulo: Articulo;
    precioBase: Dinero;
    incrementoMinimo: Dinero;
    fechaPublicacion: Date;
    fechaCierre: Date;
    estado: EstadoSubasta;
    pujas: Puja[];
    intentosFallidos: IntentoPujaFallida[];
    ganadorId: string | null;
    ordenPago: OrdenPago | null;
}

export class Subasta {

    // RN-05: los datos de la publicación son de solo lectura.
    public readonly id: string;
    public readonly vendedorId: string;
    public readonly articulo: Articulo;
    public readonly precioBase: Dinero;
    public readonly incrementoMinimo: Dinero;
    public readonly fechaPublicacion: Date;
    public readonly fechaCierre: Date;

    private estado: EstadoSubasta;
    private readonly pujas: Puja[];
    private readonly intentosFallidos: IntentoPujaFallida[];
    private ganadorId: string | null;
    private ordenPago: OrdenPago | null;

    private constructor(datos: DatosSubasta) {
        this.id = datos.id;
        this.vendedorId = datos.vendedorId;
        this.articulo = datos.articulo;
        this.precioBase = datos.precioBase;
        this.incrementoMinimo = datos.incrementoMinimo;
        this.fechaPublicacion = datos.fechaPublicacion;
        this.fechaCierre = datos.fechaCierre;
        this.estado = datos.estado;
        this.pujas = [...datos.pujas];
        this.intentosFallidos = [...datos.intentosFallidos];
        this.ganadorId = datos.ganadorId;
        this.ordenPago = datos.ordenPago;
    }

    // ───────────────────────────── Publicación ─────────────────────────────

    static publicar(
        datos: {
            id: string;
            vendedorId: string;
            articulo: Articulo;
            precioBase: Dinero;
            incrementoMinimo: Dinero;
            fechaCierre: Date;
        },
        ahora: Date = new Date()
    ): Subasta {

        // RN-01: precio base e incremento mayores que cero, con fecha de cierre.
        if (datos.precioBase.esCero()) {
            throw new ErrorDominio(
                "RN-01",
                "El precio base debe ser mayor que cero"
            );
        }

        if (datos.incrementoMinimo.esCero()) {
            throw new ErrorDominio(
                "RN-01",
                "El incremento mínimo debe ser mayor que cero"
            );
        }

        if (!(datos.fechaCierre instanceof Date) || isNaN(datos.fechaCierre.getTime())) {
            throw new ErrorDominio(
                "RN-01",
                "La subasta debe tener una fecha y hora de cierre válida"
            );
        }

        // RN-02: no puede nacer vencida.
        if (datos.fechaCierre.getTime() <= ahora.getTime()) {
            throw new ErrorDominio(
                "RN-02",
                "La fecha de cierre debe ser posterior al momento de la publicación"
            );
        }

        // RN-03: entre una hora y treinta días calendario.
        const duracion = datos.fechaCierre.getTime() - ahora.getTime();

        if (duracion < DURACION_MINIMA_MS) {
            throw new ErrorDominio(
                "RN-03",
                "La subasta debe durar al menos una hora"
            );
        }

        if (duracion > DURACION_MAXIMA_MS) {
            throw new ErrorDominio(
                "RN-03",
                "La subasta no puede durar más de treinta días calendario"
            );
        }

        return new Subasta({
            id: datos.id,
            vendedorId: datos.vendedorId,
            articulo: datos.articulo,
            precioBase: datos.precioBase,
            incrementoMinimo: datos.incrementoMinimo,
            fechaPublicacion: ahora,
            fechaCierre: datos.fechaCierre,
            estado: EstadoSubasta.ABIERTA,
            pujas: [],
            intentosFallidos: [],
            ganadorId: null,
            ordenPago: null
        });
    }

    // Restaura una subasta guardada sin repetir las validaciones de publicación.
    static reconstruir(datos: DatosSubasta): Subasta {
        return new Subasta(datos);
    }

    // ──────────────────────────────── Pujas ────────────────────────────────

    registrarPuja(
        postorId: string,
        valorOfrecido: number,
        ahora: Date = new Date()
    ): PujaAceptada {

        // RN-06: solo subastas abiertas y dentro de su plazo.
        if (this.estado !== EstadoSubasta.ABIERTA || this.plazoTerminado(ahora)) {
            this.rechazar(
                postorId, valorOfrecido, ahora,
                "RN-06", "Solo se aceptan pujas sobre subastas abiertas"
            );
        }

        // RN-07: el vendedor no puja por su propio artículo.
        if (postorId === this.vendedorId) {
            this.rechazar(
                postorId, valorOfrecido, ahora,
                "RN-07", "No puede pujar por un artículo que usted mismo publicó"
            );
        }

        // RN-21: el monto debe ser un valor monetario válido.
        let valor: Dinero;
        try {
            valor = new Dinero(valorOfrecido);
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : "Monto inválido";
            return this.rechazar(postorId, valorOfrecido, ahora, "RN-21", mensaje);
        }

        const vigente = this.obtenerPujaVigente();

        // RN-10: el mejor postor no puede superarse a sí mismo.
        if (vigente && vigente.postorId === postorId) {
            this.rechazar(
                postorId, valorOfrecido, ahora,
                "RN-10", "Usted ya es el mejor postor; no puede superar su propia puja"
            );
        }

        if (!vigente) {
            // RN-08: la primera puja debe ser mayor o igual al precio base.
            if (valor.esMenorQue(this.precioBase)) {
                this.rechazar(
                    postorId, valorOfrecido, ahora,
                    "RN-08",
                    `La primera puja debe ser de al menos ${this.precioBase.formatear()} (precio base)`
                );
            }
        } else {
            // RN-09: superar la vigente en al menos el incremento mínimo.
            const minimo = vigente.valor.sumar(this.incrementoMinimo);

            if (valor.esMenorQue(minimo)) {
                this.rechazar(
                    postorId, valorOfrecido, ahora,
                    "RN-09",
                    `La puja debe ser de al menos ${minimo.formatear()} ` +
                    `(oferta vigente más el incremento mínimo)`
                );
            }
        }

        // RN-11: la puja aceptada se agrega y nunca se retira.
        const puja = new Puja(postorId, valor, ahora);
        this.pujas.push(puja);

        return {
            puja,
            postorSuperadoId: vigente ? vigente.postorId : null
        };
    }

    // RN-12: todo rechazo queda registrado con su motivo antes de informarse.
    private rechazar(
        postorId: string,
        valorOfrecido: number,
        ahora: Date,
        codigo: string,
        motivo: string
    ): never {

        this.intentosFallidos.push(
            new IntentoPujaFallida(
                postorId,
                Number.isFinite(valorOfrecido) ? valorOfrecido : 0,
                codigo,
                motivo,
                ahora
            )
        );

        throw new ErrorDominio(codigo, motivo);
    }

    // ───────────────────────────── Cancelación ─────────────────────────────

    cancelar(solicitanteId: string, ahora: Date = new Date()): void {

        if (solicitanteId !== this.vendedorId) {
            throw new ErrorDominio(
                "SOLO_VENDEDOR",
                "Solo el vendedor puede cancelar su subasta",
                "PROHIBIDO"
            );
        }

        if (this.estado !== EstadoSubasta.ABIERTA || this.plazoTerminado(ahora)) {
            throw new ErrorDominio(
                "RN-04",
                "Solo puede cancelarse una subasta abierta"
            );
        }

        // RN-04: con la primera puja la venta queda comprometida.
        if (this.pujas.length > 0) {
            throw new ErrorDominio(
                "RN-04",
                "No se puede cancelar una subasta que ya recibió pujas"
            );
        }

        this.estado = EstadoSubasta.CANCELADA;
    }

    // ───────────────────────── Cierre y adjudicación ─────────────────────────

    // Cierre perezoso: si el plazo terminó y sigue abierta, la cierra.
    // Devuelve true solo cuando el cierre ocurre en esta llamada.
    verificarCierre(ahora: Date = new Date()): boolean {

        if (this.estado !== EstadoSubasta.ABIERTA || !this.plazoTerminado(ahora)) {
            return false;
        }

        this.cerrar(ahora);
        return true;
    }

    cerrar(ahora: Date = new Date()): void {

        // RN-16: una subasta solo se cierra una vez.
        if (this.estado !== EstadoSubasta.ABIERTA) {
            throw new ErrorDominio(
                "RN-16",
                "La subasta ya no está abierta; su resultado no puede alterarse",
                "CONFLICTO"
            );
        }

        if (!this.plazoTerminado(ahora)) {
            throw new ErrorDominio(
                "RN-13",
                "La subasta aún no llega a su fecha de cierre"
            );
        }

        const ganadora = this.obtenerPujaVigente();

        // RN-14: sin pujas se declara desierta y no genera pago.
        if (!ganadora) {
            this.estado = EstadoSubasta.DESIERTA;
            return;
        }

        // RN-13 y RN-15: se adjudica al mejor postor y nace la orden de pago.
        this.ganadorId = ganadora.postorId;
        this.ordenPago = OrdenPago.emitir({
            subastaId: this.id,
            ganadorId: ganadora.postorId,
            valor: ganadora.valor,
            ahora
        });
        this.estado = EstadoSubasta.CERRADA;
    }

    // ──────────────────────────────── Pago ────────────────────────────────

    // RN-20: si el plazo de la orden pasó sin confirmación, se declara vencida.
    verificarVencimientoPago(ahora: Date = new Date()): boolean {

        if (
            this.estado !== EstadoSubasta.CERRADA ||
            !this.ordenPago ||
            this.ordenPago.obtenerEstado() !== EstadoPago.PENDIENTE ||
            !this.ordenPago.plazoVencido(ahora)
        ) {
            return false;
        }

        this.ordenPago.vencer();
        this.estado = EstadoSubasta.INCUMPLIDA;
        return true;
    }

    // RN-17: el pago solo se confirma a partir de la notificación de la pasarela.
    // Devuelve true si el estado cambió.
    registrarResultadoPago(
        resultado: ResultadoPago,
        ahora: Date = new Date()
    ): boolean {

        const orden = this.ordenPago;

        if (!orden) {
            throw new ErrorDominio(
                "ORDEN_INEXISTENTE",
                "La subasta no tiene una orden de pago",
                "NO_ENCONTRADO"
            );
        }

        this.verificarVencimientoPago(ahora);

        if (orden.obtenerEstado() === EstadoPago.VENCIDA) {
            throw new ErrorDominio(
                "RN-20",
                "La orden de pago está vencida; la subasta quedó en incumplimiento",
                "CONFLICTO"
            );
        }

        if (orden.obtenerEstado() === EstadoPago.PAGADA) {
            return false;
        }

        if (resultado === ResultadoPago.RECHAZADO) {
            // El cobro falló: la orden sigue pendiente dentro de su plazo.
            return false;
        }

        orden.confirmarPago(ahora);
        this.estado = EstadoSubasta.PAGADA;
        return true;
    }

    // ───────────────────────────── Consultas ─────────────────────────────

    obtenerEstado(): EstadoSubasta {
        return this.estado;
    }

    obtenerPujas(): readonly Puja[] {
        return [...this.pujas];
    }

    obtenerIntentosFallidos(): readonly IntentoPujaFallida[] {
        return [...this.intentosFallidos];
    }

    obtenerPujaVigente(): Puja | null {
        return this.pujas.length > 0 ? this.pujas[this.pujas.length - 1] : null;
    }

    obtenerGanadorId(): string | null {
        return this.ganadorId;
    }

    obtenerOrdenPago(): OrdenPago | null {
        return this.ordenPago;
    }

    // Monto mínimo que se aceptaría en la siguiente puja.
    montoMinimoSiguiente(): number {
        const vigente = this.obtenerPujaVigente();
        return vigente
            ? vigente.valor.sumar(this.incrementoMinimo).obtenerValor()
            : this.precioBase.obtenerValor();
    }

    obtenerParticipantesIds(): string[] {
        return [...new Set(this.pujas.map((puja) => puja.postorId))];
    }

    plazoTerminado(ahora: Date = new Date()): boolean {
        return ahora.getTime() >= this.fechaCierre.getTime();
    }

}
