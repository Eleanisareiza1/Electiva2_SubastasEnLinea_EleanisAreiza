import { ErrorDominio } from "../errors/ErrorDominio";

// Estado de conservación del artículo que se subasta.
export enum EstadoConservacion {
    NUEVO = "NUEVO",
    COMO_NUEVO = "COMO_NUEVO",
    BUEN_ESTADO = "BUEN_ESTADO",
    USADO = "USADO",
    PARA_REPARAR = "PARA_REPARAR"
}

export function aEstadoConservacion(valor: string): EstadoConservacion {

    const estados = Object.values(EstadoConservacion) as string[];

    if (!estados.includes(valor)) {
        throw new ErrorDominio(
            "ESTADO_CONSERVACION_INVALIDO",
            `El estado de conservación debe ser uno de: ${estados.join(", ")}`,
            "VALIDACION"
        );
    }

    return valor as EstadoConservacion;
}
