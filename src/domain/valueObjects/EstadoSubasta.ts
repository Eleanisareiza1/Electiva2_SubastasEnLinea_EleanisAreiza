import { ErrorDominio } from "../errors/ErrorDominio";

// Estados del ciclo de vida de una subasta.
//   ABIERTA    -> recibe pujas.
//   CANCELADA  -> el vendedor la canceló antes de la primera puja (RN-04).
//   DESIERTA   -> llegó al cierre sin pujas (RN-14).
//   CERRADA    -> adjudicada al ganador, con orden de pago pendiente (RN-13, RN-15).
//   PAGADA     -> la pasarela confirmó el pago (RN-17).
//   INCUMPLIDA -> la orden de pago venció sin confirmación (RN-20).
export enum EstadoSubasta {
    ABIERTA = "ABIERTA",
    CANCELADA = "CANCELADA",
    DESIERTA = "DESIERTA",
    CERRADA = "CERRADA",
    PAGADA = "PAGADA",
    INCUMPLIDA = "INCUMPLIDA"
}

// Convierte un texto (por ejemplo leído de la base de datos) en un estado válido.
export function aEstadoSubasta(valor: string): EstadoSubasta {

    const estados = Object.values(EstadoSubasta) as string[];

    if (!estados.includes(valor)) {
        throw new ErrorDominio(
            "ESTADO_INVALIDO",
            `"${valor}" no es un estado de subasta válido`,
            "VALIDACION"
        );
    }

    return valor as EstadoSubasta;
}
