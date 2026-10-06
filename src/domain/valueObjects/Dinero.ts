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

    obtenerValor(): number {
        return this.valor;
    }

    sumar(
        otroDinero: Dinero
    ): Dinero {

        return new Dinero(
            this.valor +
            otroDinero.obtenerValor()
        );

    }

}