import { ErrorDominio } from "../errors/ErrorDominio";

// Objeto de valor monetario en pesos colombianos (RN-21):
// entero, sin decimales y nunca negativo. Es inmutable.
export class Dinero {

    private readonly valor: number;

    constructor(valor: number) {

        if (typeof valor !== "number" || !Number.isFinite(valor)) {
            throw new ErrorDominio(
                "RN-21",
                "El valor monetario debe ser un número",
                "VALIDACION"
            );
        }

        if (!Number.isInteger(valor)) {
            throw new ErrorDominio(
                "RN-21",
                "Los valores monetarios se expresan en pesos colombianos sin decimales",
                "VALIDACION"
            );
        }

        if (valor < 0) {
            throw new ErrorDominio(
                "RN-21",
                "Los valores monetarios no pueden ser negativos",
                "VALIDACION"
            );
        }

        this.valor = valor;
    }

    obtenerValor(): number {
        return this.valor;
    }

    // Representación legible en pesos colombianos, por ejemplo "$5.000.000".
    formatear(): string {
        return "$" + this.valor.toLocaleString("es-CO");
    }

    esCero(): boolean {
        return this.valor === 0;
    }

    // Devuelve un nuevo objeto: el original nunca cambia.
    sumar(otro: Dinero): Dinero {
        return new Dinero(this.valor + otro.obtenerValor());
    }

    esMenorQue(otro: Dinero): boolean {
        return this.valor < otro.obtenerValor();
    }

}
