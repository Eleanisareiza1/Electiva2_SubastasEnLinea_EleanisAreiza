import { EstadoPago }
from "./valueObjects/EstadoPago";

// Información de pago generada al adjudicar una subasta a un ganador.
export class OrdenPago {

    constructor(
        public readonly ganadorId: string,
        public readonly valor: number,
        public readonly fechaLimite: Date,
        private estado: EstadoPago =
            EstadoPago.PENDIENTE
    ) {}

    obtenerEstado(): EstadoPago {

        return this.estado;

    }

    confirmarPago(): void {

        this.estado =
            EstadoPago.PAGADO;

    }

    vencer(): void {

        this.estado =
            EstadoPago.VENCIDO;

    }

}