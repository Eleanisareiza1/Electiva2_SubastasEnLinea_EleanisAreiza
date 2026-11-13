import { ErrorDominio } from "../errors/ErrorDominio";

// Estados de una orden de pago.
export enum EstadoPago {
    PENDIENTE = "PENDIENTE",
    PAGADA = "PAGADA",
    VENCIDA = "VENCIDA"
}

export function aEstadoPago(valor: string): EstadoPago {

    const estados = Object.values(EstadoPago) as string[];

    if (!estados.includes(valor)) {
        throw new ErrorDominio(
            "ESTADO_INVALIDO",
            `"${valor}" no es un estado de pago válido`,
            "VALIDACION"
        );
    }

    return valor as EstadoPago;
}
