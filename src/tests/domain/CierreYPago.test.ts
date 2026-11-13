import { ErrorDominio } from "../../domain/errors/ErrorDominio";
import { EstadoPago } from "../../domain/valueObjects/EstadoPago";
import { EstadoSubasta } from "../../domain/valueObjects/EstadoSubasta";
import { ResultadoPago } from "../../domain/valueObjects/ResultadoPago";
import { HORA, enHoras, subastaDePrueba } from "../fabricas";

function adjudicada() {
    const subasta = subastaDePrueba({ horas: 2 });
    subasta.registrarPuja("ana", 1000, enHoras(1));
    subasta.registrarPuja("luis", 1500, enHoras(1.5));
    subasta.verificarCierre(enHoras(2));
    return subasta;
}

describe("Cierre y adjudicación", () => {

    test("no se cierra antes de su fecha", () => {
        const subasta = subastaDePrueba({ horas: 2 });
        expect(subasta.verificarCierre(enHoras(1))).toBe(false);
        expect(() => subasta.cerrar(enHoras(1))).toThrow(ErrorDominio);
        expect(subasta.obtenerEstado()).toBe(EstadoSubasta.ABIERTA);
    });

    test("RN-13 y RN-15: adjudica al mejor postor y emite orden por 48 horas", () => {
        const subasta = adjudicada();
        const orden = subasta.obtenerOrdenPago();
        expect(subasta.obtenerEstado()).toBe(EstadoSubasta.CERRADA);
        expect(subasta.obtenerGanadorId()).toBe("luis");
        expect(orden?.ganadorId).toBe("luis");
        expect(orden?.valor.obtenerValor()).toBe(1500);
        expect(orden?.obtenerEstado()).toBe(EstadoPago.PENDIENTE);
        expect(orden!.fechaLimite.getTime() - enHoras(2).getTime()).toBe(48 * HORA);
    });

    test("RN-14: sin pujas queda desierta y sin orden de pago", () => {
        const subasta = subastaDePrueba({ horas: 2 });
        expect(subasta.verificarCierre(enHoras(3))).toBe(true);
        expect(subasta.obtenerEstado()).toBe(EstadoSubasta.DESIERTA);
        expect(subasta.obtenerOrdenPago()).toBeNull();
    });

    test("RN-16: un segundo cierre no altera el resultado ni crea otra orden", () => {
        const subasta = adjudicada();
        const orden = subasta.obtenerOrdenPago();
        expect(subasta.verificarCierre(enHoras(5))).toBe(false);
        expect(() => subasta.cerrar(enHoras(5))).toThrow("no puede alterarse");
        expect(subasta.obtenerOrdenPago()).toBe(orden);
        expect(subasta.obtenerGanadorId()).toBe("luis");
    });

    test("RN-06: después del cierre no se aceptan pujas", () => {
        const subasta = adjudicada();
        expect(() => subasta.registrarPuja("ana", 99_999, enHoras(3))).toThrow("abiertas");
    });

});

describe("Pago de la orden", () => {

    test("RN-17: solo la notificación aprobada confirma el pago", () => {
        const subasta = adjudicada();
        expect(subasta.registrarResultadoPago(ResultadoPago.RECHAZADO, enHoras(3))).toBe(false);
        expect(subasta.obtenerOrdenPago()?.obtenerEstado()).toBe(EstadoPago.PENDIENTE);
        expect(subasta.registrarResultadoPago(ResultadoPago.APROBADO, enHoras(4))).toBe(true);
        expect(subasta.obtenerOrdenPago()?.obtenerEstado()).toBe(EstadoPago.PAGADA);
        expect(subasta.obtenerEstado()).toBe(EstadoSubasta.PAGADA);
    });

    test("un pago ya confirmado no vuelve a cambiar", () => {
        const subasta = adjudicada();
        subasta.registrarResultadoPago(ResultadoPago.APROBADO, enHoras(3));
        expect(subasta.registrarResultadoPago(ResultadoPago.APROBADO, enHoras(4))).toBe(false);
    });

    test("RN-20: vencido el plazo, la orden vence y la subasta queda en incumplimiento", () => {
        const subasta = adjudicada();
        expect(subasta.verificarVencimientoPago(enHoras(2 + 47))).toBe(false);
        expect(subasta.verificarVencimientoPago(enHoras(2 + 48.1))).toBe(true);
        expect(subasta.obtenerOrdenPago()?.obtenerEstado()).toBe(EstadoPago.VENCIDA);
        expect(subasta.obtenerEstado()).toBe(EstadoSubasta.INCUMPLIDA);
        expect(() => subasta.registrarResultadoPago(ResultadoPago.APROBADO, enHoras(60))).toThrow(ErrorDominio);
    });

});
