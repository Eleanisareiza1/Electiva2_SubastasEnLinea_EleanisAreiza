// Error que lanza el modelo de dominio cuando una regla del negocio no se cumple.
// El "codigo" identifica la regla (por ejemplo RN-09) y el "tipo" permite que la
// infraestructura elija el código HTTP sin que el dominio conozca HTTP.
export type TipoErrorDominio =
    | "REGLA_NEGOCIO"
    | "VALIDACION"
    | "NO_ENCONTRADO"
    | "CONFLICTO"
    | "NO_AUTENTICADO"
    | "PROHIBIDO";

export class ErrorDominio extends Error {

    constructor(
        public readonly codigo: string,
        mensaje: string,
        public readonly tipo: TipoErrorDominio = "REGLA_NEGOCIO"
    ) {
        super(mensaje);
        this.name = "ErrorDominio";
    }

}
