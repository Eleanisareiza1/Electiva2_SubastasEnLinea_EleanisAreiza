import { ErrorDominio } from "./errors/ErrorDominio";
import { Dinero } from "./valueObjects/Dinero";
import { EstadoPago } from "./valueObjects/EstadoPago";

// Plazo para cubrir la orden de pago (RN-15).
export const PLAZO_PAGO_HORAS = 48;

// Obligación económica que nace al adjudicar una subasta.
// Pertenece al agregado Subasta: solo la subasta la crea y la modifica.
export class OrdenPago {

    private constructor(
        public readonly id: string,
        public readonly subastaId: string,
        public readonly ganadorId: string,
        public readonly valor: Dinero,
        public readonly fechaEmision: Date,
        public readonly fechaLimite: Date,
        private estado: EstadoPago,
        private fechaPago: Date | null
    ) {}

    // RN-15: valor de la puja ganadora, a nombre del ganador, con 48 horas de plazo.
    static emitir(datos: {
        subastaId: string;
        ganadorId: string;
        valor: Dinero;
        ahora: Date;
    }): OrdenPago {

        const fechaLimite = new Date(
            datos.ahora.getTime() + PLAZO_PAGO_HORAS * 60 * 60 * 1000
        );

        // Una subasta genera como máximo una orden (RN-16), por eso el id se deriva de ella.
        return new OrdenPago(
            `orden-${datos.subastaId}`,
            datos.subastaId,
            datos.ganadorId,
            datos.valor,
            datos.ahora,
            fechaLimite,
            EstadoPago.PENDIENTE,
            null
        );
    }

    static reconstruir(datos: {
        id: string;
        subastaId: string;
        ganadorId: string;
        valor: Dinero;
        fechaEmision: Date;
        fechaLimite: Date;
        estado: EstadoPago;
        fechaPago: Date | null;
    }): OrdenPago {

        return new OrdenPago(
            datos.id,
            datos.subastaId,
            datos.ganadorId,
            datos.valor,
            datos.fechaEmision,
            datos.fechaLimite,
            datos.estado,
            datos.fechaPago
        );
    }

    obtenerEstado(): EstadoPago {
        return this.estado;
    }

    obtenerFechaPago(): Date | null {
        return this.fechaPago;
    }

    plazoVencido(ahora: Date): boolean {
        return ahora.getTime() > this.fechaLimite.getTime();
    }

    // RN-17: solo se invoca cuando la pasarela notifica un pago aprobado.
    confirmarPago(ahora: Date): void {

        if (this.estado !== EstadoPago.PENDIENTE) {
            throw new ErrorDominio(
                "ORDEN_NO_PENDIENTE",
                "Solo una orden pendiente puede confirmarse",
                "CONFLICTO"
            );
        }

        this.estado = EstadoPago.PAGADA;
        this.fechaPago = ahora;
    }

    // RN-20: el plazo pasó sin confirmación.
    vencer(): void {

        if (this.estado !== EstadoPago.PENDIENTE) {
            throw new ErrorDominio(
                "ORDEN_NO_PENDIENTE",
                "Solo una orden pendiente puede vencerse",
                "CONFLICTO"
            );
        }

        this.estado = EstadoPago.VENCIDA;
    }

}
