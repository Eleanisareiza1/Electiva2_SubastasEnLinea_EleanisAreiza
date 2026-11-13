import { ErrorDominio } from "../errors/ErrorDominio";

// Resultado de un cobro tal como lo informa la pasarela externa.
export enum ResultadoPago {
    APROBADO = "APROBADO",
    RECHAZADO = "RECHAZADO"
}

export function aResultadoPago(valor: string): ResultadoPago {

    const resultados = Object.values(ResultadoPago) as string[];

    if (!resultados.includes(valor)) {
        throw new ErrorDominio(
            "RESULTADO_PAGO_INVALIDO",
            "El resultado del pago debe ser APROBADO o RECHAZADO",
            "VALIDACION"
        );
    }

    return valor as ResultadoPago;
}
