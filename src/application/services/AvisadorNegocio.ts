// Anuncia los hechos relevantes del negocio: guarda las notificaciones de cada
// usuario y las difunde por el puerto de salida (RNF-05). No conoce WebSockets.

import { Notificacion } from "../../domain/Notificacion";
import { PujaAceptada, Subasta } from "../../domain/Subasta";
import { NotificacionRepository } from "../../domain/repositories/NotificacionRepository";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { EstadoSubasta } from "../../domain/valueObjects/EstadoSubasta";
import { TipoNotificacion } from "../../domain/valueObjects/TipoNotificacion";
import { GeneradorIds } from "../ports/GeneradorIds";
import { NotificacionPort } from "../ports/NotificacionPort";

export function formatearPesos(valor: number): string {
    return "$" + valor.toLocaleString("es-CO");
}

export class AvisadorNegocio {

    constructor(
        private readonly notificaciones: NotificacionRepository,
        private readonly usuarios: UsuarioRepository,
        private readonly tiempoReal: NotificacionPort,
        private readonly ids: GeneradorIds
    ) {}

    async nuevaPuja(subasta: Subasta, aceptada: PujaAceptada): Promise<void> {

        const postor = await this.usuarios.buscarPorId(aceptada.puja.postorId);
        const valor = aceptada.puja.valor.obtenerValor();

        this.tiempoReal.difundirNuevaPuja({
            subastaId: subasta.id,
            valor,
            postorId: aceptada.puja.postorId,
            postorNombre: postor?.nombre ?? "Usuario",
            fecha: aceptada.puja.fecha.toISOString(),
            totalPujas: subasta.obtenerPujas().length,
            montoMinimoSiguiente: subasta.montoMinimoSiguiente()
        });

        // RF-14: aviso al postor que acaba de ser superado.
        if (aceptada.postorSuperadoId && aceptada.postorSuperadoId !== aceptada.puja.postorId) {
            await this.notificar(
                aceptada.postorSuperadoId,
                TipoNotificacion.PUJA_SUPERADA,
                `Te superaron en «${subasta.articulo.nombre}». La nueva oferta es ${formatearPesos(valor)}.`,
                subasta.id
            );
        }
    }

    async subastaCerrada(subasta: Subasta): Promise<void> {

        const titulo = subasta.articulo.nombre;
        const ganadorId = subasta.obtenerGanadorId();
        const orden = subasta.obtenerOrdenPago();
        const ganador = ganadorId ? await this.usuarios.buscarPorId(ganadorId) : null;

        if (subasta.obtenerEstado() === EstadoSubasta.DESIERTA) {

            this.difundir(subasta, null, `La subasta «${titulo}» cerró sin pujas y fue declarada desierta.`);

            await this.notificar(
                subasta.vendedorId,
                TipoNotificacion.SUBASTA_DESIERTA,
                `Tu subasta «${titulo}» cerró sin pujas y fue declarada desierta.`,
                subasta.id
            );
            return;
        }

        const valor = orden ? formatearPesos(orden.valor.obtenerValor()) : "";

        this.difundir(
            subasta,
            ganador?.nombre ?? null,
            `Subasta cerrada. Ganador: ${ganador?.nombre ?? "Usuario"} con ${valor}.`
        );

        if (ganadorId) {
            await this.notificar(
                ganadorId,
                TipoNotificacion.SUBASTA_GANADA,
                `¡Ganaste «${titulo}» por ${valor}! Tienes 48 horas para pagar la orden.`,
                subasta.id
            );
        }

        await this.notificar(
            subasta.vendedorId,
            TipoNotificacion.SUBASTA_VENDIDA,
            `Tu subasta «${titulo}» se adjudicó a ${ganador?.nombre ?? "un usuario"} por ${valor}.`,
            subasta.id
        );
    }

    async subastaCancelada(subasta: Subasta): Promise<void> {
        this.difundir(subasta, null, `La subasta «${subasta.articulo.nombre}» fue cancelada por el vendedor.`);
    }

    async pagoConfirmado(subasta: Subasta): Promise<void> {

        const titulo = subasta.articulo.nombre;
        const ganadorId = subasta.obtenerGanadorId();
        const ganador = ganadorId ? await this.usuarios.buscarPorId(ganadorId) : null;

        this.difundir(subasta, ganador?.nombre ?? null, `El pago de «${titulo}» fue confirmado por la pasarela.`);

        if (ganadorId) {
            await this.notificar(
                ganadorId,
                TipoNotificacion.PAGO_CONFIRMADO,
                `La pasarela confirmó tu pago de «${titulo}».`,
                subasta.id
            );
        }

        await this.notificar(
            subasta.vendedorId,
            TipoNotificacion.PAGO_CONFIRMADO,
            `El comprador pagó «${titulo}». ¡Venta completada!`,
            subasta.id
        );
    }

    async pagoRechazado(subasta: Subasta): Promise<void> {

        const ganadorId = subasta.obtenerGanadorId();

        if (ganadorId) {
            await this.notificar(
                ganadorId,
                TipoNotificacion.PAGO_RECHAZADO,
                `La pasarela rechazó el cobro de «${subasta.articulo.nombre}». Puedes intentarlo de nuevo dentro del plazo.`,
                subasta.id
            );
        }
    }

    async ordenVencida(subasta: Subasta): Promise<void> {

        const titulo = subasta.articulo.nombre;
        const ganadorId = subasta.obtenerGanadorId();

        this.difundir(subasta, null, `La orden de pago de «${titulo}» venció. La subasta quedó en incumplimiento.`);

        if (ganadorId) {
            await this.notificar(
                ganadorId,
                TipoNotificacion.ORDEN_VENCIDA,
                `Tu orden de pago de «${titulo}» venció sin confirmación.`,
                subasta.id
            );
        }

        await this.notificar(
            subasta.vendedorId,
            TipoNotificacion.ORDEN_VENCIDA,
            `El comprador no pagó «${titulo}» a tiempo. La subasta quedó en incumplimiento.`,
            subasta.id
        );
    }

    private difundir(subasta: Subasta, ganadorNombre: string | null, mensaje: string): void {

        const orden = subasta.obtenerOrdenPago();

        this.tiempoReal.difundirCambioEstado({
            subastaId: subasta.id,
            estado: subasta.obtenerEstado(),
            titulo: subasta.articulo.nombre,
            ganadorId: subasta.obtenerGanadorId(),
            ganadorNombre,
            valorFinal: orden ? orden.valor.obtenerValor() : null,
            mensaje
        });
    }

    private async notificar(
        usuarioId: string,
        tipo: TipoNotificacion,
        mensaje: string,
        subastaId: string
    ): Promise<void> {

        const notificacion = new Notificacion(
            this.ids.generar(),
            usuarioId,
            tipo,
            mensaje,
            subastaId,
            new Date()
        );

        await this.notificaciones.guardar(notificacion);

        this.tiempoReal.enviarAUsuario(usuarioId, {
            id: notificacion.id,
            tipo: notificacion.tipo,
            mensaje: notificacion.mensaje,
            subastaId: notificacion.subastaId,
            fecha: notificacion.fecha.toISOString(),
            leida: notificacion.estaLeida()
        });
    }

}
