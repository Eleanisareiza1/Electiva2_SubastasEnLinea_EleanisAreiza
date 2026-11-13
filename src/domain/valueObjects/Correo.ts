import { ErrorDominio } from "../errors/ErrorDominio";

const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Objeto de valor para el correo electrónico: se normaliza en minúsculas
// para que la unicidad (RN-22) no dependa de mayúsculas o espacios.
export class Correo {

    private readonly valor: string;

    constructor(valor: string) {

        const normalizado =
            typeof valor === "string" ? valor.trim().toLowerCase() : "";

        if (!FORMATO_CORREO.test(normalizado) || normalizado.length > 254) {
            throw new ErrorDominio(
                "CORREO_INVALIDO",
                "El correo electrónico no tiene un formato válido",
                "VALIDACION"
            );
        }

        this.valor = normalizado;
    }

    obtenerValor(): string {
        return this.valor;
    }

    esIgualA(otro: Correo): boolean {
        return this.valor === otro.obtenerValor();
    }

}
