import { ErrorDominio } from "../../domain/errors/ErrorDominio";
import { Subasta } from "../../domain/Subasta";
import { enHoras, subastaDePrueba } from "../fabricas";

const DURANTE = enHoras(1);

function rechazo(subasta: Subasta, postor: string, valor: number, cuando = DURANTE): string {
    try {
        subasta.registrarPuja(postor, valor, cuando);
    } catch (error) {
        if (error instanceof ErrorDominio) {
            return error.codigo;
        }
        throw error;
    }
    throw new Error("La puja debió rechazarse");
}

describe("Aceptación y rechazo de pujas", () => {

    test("acepta una primera puja igual al precio base (RN-08)", () => {
        const subasta = subastaDePrueba();
        const resultado = subasta.registrarPuja("ana", 1000, DURANTE);
        expect(resultado.postorSuperadoId).toBeNull();
        expect(subasta.obtenerPujaVigente()?.valor.obtenerValor()).toBe(1000);
    });

    test("RN-08: rechaza una primera puja menor al precio base", () => {
        expect(rechazo(subastaDePrueba(), "ana", 999)).toBe("RN-08");
    });

    test("RN-09: exige superar la vigente en al menos el incremento", () => {
        const subasta = subastaDePrueba();
        subasta.registrarPuja("ana", 1000, DURANTE);
        expect(rechazo(subasta, "luis", 1099)).toBe("RN-09");
        expect(rechazo(subasta, "luis", 1000)).toBe("RN-09");
        expect(() => subasta.registrarPuja("luis", 1100, DURANTE)).not.toThrow();
    });

    test("informa quién fue superado", () => {
        const subasta = subastaDePrueba();
        subasta.registrarPuja("ana", 1000, DURANTE);
        expect(subasta.registrarPuja("luis", 1200, DURANTE).postorSuperadoId).toBe("ana");
    });

    test("RN-07: el vendedor no puede pujar", () => {
        expect(rechazo(subastaDePrueba(), "vendedor", 1000)).toBe("RN-07");
    });

    test("RN-10: el mejor postor no puede superarse a sí mismo", () => {
        const subasta = subastaDePrueba();
        subasta.registrarPuja("ana", 1000, DURANTE);
        expect(rechazo(subasta, "ana", 5000)).toBe("RN-10");
    });

    test("RN-06: no admite pujas en subastas canceladas", () => {
        const subasta = subastaDePrueba();
        subasta.cancelar("vendedor", DURANTE);
        expect(rechazo(subasta, "ana", 1000)).toBe("RN-06");
    });

    test("RN-06: no admite pujas una vez vencido el plazo", () => {
        expect(rechazo(subastaDePrueba({ horas: 2 }), "ana", 1000, enHoras(2))).toBe("RN-06");
    });

    test("RN-21: rechaza montos con decimales", () => {
        expect(rechazo(subastaDePrueba(), "ana", 1000.5)).toBe("RN-21");
    });

    test("RN-11: la puja aceptada no puede retirarse ni modificarse", () => {
        const subasta = subastaDePrueba();
        subasta.registrarPuja("ana", 1000, DURANTE);
        const copia = subasta.obtenerPujas() as unknown as unknown[];
        copia.pop();
        expect(subasta.obtenerPujas()).toHaveLength(1);
        expect("retirarPuja" in subasta).toBe(false);
    });

    test("RN-12: cada rechazo queda registrado con su motivo", () => {
        const subasta = subastaDePrueba();
        rechazo(subasta, "vendedor", 1000);
        rechazo(subasta, "ana", 10);
        const intentos = subasta.obtenerIntentosFallidos();
        expect(intentos.map((i) => i.codigoRegla)).toEqual(["RN-07", "RN-08"]);
        expect(intentos[1].postorId).toBe("ana");
        expect(intentos[1].valorOfrecido).toBe(10);
        expect(intentos[1].motivo).toContain("al menos");
    });

});

describe("Cancelación", () => {

    test("RN-04: no se cancela con pujas", () => {
        const subasta = subastaDePrueba();
        subasta.registrarPuja("ana", 1000, DURANTE);
        expect(() => subasta.cancelar("vendedor", DURANTE)).toThrow(ErrorDominio);
    });

    test("solo el vendedor puede cancelar", () => {
        expect(() => subastaDePrueba().cancelar("ana", DURANTE)).toThrow("Solo el vendedor");
    });

});
