// Objeto de valor monetario que valida importes enteros no negativos y permite sumarlos.
export class Dinero {

    private readonly valor: number;

    constructor(valor: number) {

        if (!Number.isInteger(valor)) {
            throw new Error(
                "RN-21: Los valores monetarios no pueden tener decimales"
            );
        }

        if (valor < 0) {
            throw new Error(
                "RN-21: Los valores monetarios no pueden ser negativos"
            );
        }

        this.valor = valor;
    }

    // Devuelve el importe numérico encapsulado.
    obtenerValor(): number {
        return this.valor;
    }

    // Suma otro importe y devuelve un nuevo objeto de valor.
    sumar(
        otroDinero: Dinero
    ): Dinero {

        return new Dinero(
            this.valor +
            otroDinero.obtenerValor()
        );

    }

}