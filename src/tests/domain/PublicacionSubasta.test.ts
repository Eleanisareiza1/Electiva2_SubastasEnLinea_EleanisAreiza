import { Subasta } from "../../domain/Subasta";
import { ErrorDominio } from "../../domain/errors/ErrorDominio";
import { Dinero } from "../../domain/valueObjects/Dinero";
import { EstadoSubasta } from "../../domain/valueObjects/EstadoSubasta";
import { HORA, T0, articuloDePrueba, enHoras } from "../fabricas";

function publicar(precioBase: number, incremento: number, fechaCierre: Date): Subasta {
    return Subasta.publicar(
        {
            id: "s1",
            vendedorId: "vendedor",
            articulo: articuloDePrueba(),
            precioBase: new Dinero(precioBase),
            incrementoMinimo: new Dinero(incremento),
            fechaCierre
        },
        T0
    );
}

function codigoDe(accion: () => unknown): string {
    try {
        accion();
    } catch (error) {
        if (error instanceof ErrorDominio) {
            return error.codigo;
        }
        throw error;
    }
    throw new Error("Se esperaba un ErrorDominio");
}

describe("Publicación de subastas", () => {

    test("publica una subasta válida en estado ABIERTA", () => {
        const subasta = publicar(1000, 100, enHoras(24));
        expect(subasta.obtenerEstado()).toBe(EstadoSubasta.ABIERTA);
        expect(subasta.fechaPublicacion).toEqual(T0);
    });

    test("RN-01: rechaza precio base igual a cero", () => {
        expect(codigoDe(() => publicar(0, 100, enHoras(24)))).toBe("RN-01");
    });

    test("RN-01: rechaza incremento mínimo igual a cero", () => {
        expect(codigoDe(() => publicar(1000, 0, enHoras(24)))).toBe("RN-01");
    });

    test("RN-02: rechaza una fecha de cierre en el pasado", () => {
        expect(codigoDe(() => publicar(1000, 100, enHoras(-1)))).toBe("RN-02");
    });

    test("RN-03: rechaza una duración menor a una hora", () => {
        expect(codigoDe(() => publicar(1000, 100, new Date(T0.getTime() + HORA - 1)))).toBe("RN-03");
    });

    test("RN-03: acepta exactamente una hora y exactamente treinta días", () => {
        expect(() => publicar(1000, 100, enHoras(1))).not.toThrow();
        expect(() => publicar(1000, 100, enHoras(30 * 24))).not.toThrow();
    });

    test("RN-03: rechaza más de treinta días", () => {
        expect(codigoDe(() => publicar(1000, 100, enHoras(30 * 24 + 1)))).toBe("RN-03");
    });

    test("RN-05: los datos publicados son de solo lectura", () => {
        const subasta = publicar(1000, 100, enHoras(24));
        expect(Object.getOwnPropertyDescriptor(Subasta.prototype, "cambiarPrecioBase")).toBeUndefined();
        expect(subasta.precioBase.obtenerValor()).toBe(1000);
    });

});

describe("Objetos de valor", () => {

    test("RN-21: Dinero rechaza decimales y negativos", () => {
        expect(codigoDe(() => new Dinero(10.5))).toBe("RN-21");
        expect(codigoDe(() => new Dinero(-1))).toBe("RN-21");
    });

    test("Dinero es inmutable: sumar devuelve un nuevo objeto", () => {
        const a = new Dinero(100);
        const b = a.sumar(new Dinero(50));
        expect(a.obtenerValor()).toBe(100);
        expect(b.obtenerValor()).toBe(150);
    });

});
