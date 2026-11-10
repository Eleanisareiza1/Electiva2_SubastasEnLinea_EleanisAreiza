import { Subasta } from "../domain/Subasta";
import { Dinero } from "../domain/valueObjects/Dinero";

// Verifica las reglas de negocio de pujas, cancelación, cierre y adjudicación.
describe("RN-04", () => {

    test(
        "impide cancelar una subasta que ya recibió pujas",
        () => {

            const fechaCierre =
                new Date(
                    Date.now() + 86400000
                );

            const subasta =
                new Subasta(
                    "Laptop Gamer",
                    "vendedor1",
                    new Dinero(1000000),
                    new Dinero(50000),
                    fechaCierre
                );

            subasta.registrarPuja(
                "usuario1",
                1000000
            );

            expect(() => {

                subasta.cancelar();

            }).toThrow(
                "RN-04"
            );

        }
    );

});

describe("RN-05", () => {

    test(
        "rechaza pujas sobre una subasta cancelada",
        () => {

            const fechaCierre =
                new Date(
                    Date.now() + 86400000
                );

            const subasta =
                new Subasta(
                    "Laptop Gamer",
                    "vendedor1",
                    new Dinero(1000000),
                    new Dinero(50000),
                    fechaCierre
                );

            subasta.cancelar();

            expect(() => {

                subasta.registrarPuja(
                    "usuario1",
                    1000000
                );

            }).toThrow(
                "RN-06"
            );

        }
    );

});


describe("RN-06", () => {

    test(
        "rechaza pujas sobre una subasta cerrada",
        () => {

            const fechaCierre =
                new Date(
                    Date.now() + 86400000
                );

            const subasta =
                new Subasta(
                    "Laptop Gamer",
                    "vendedor1",
                    new Dinero(1000000),
                    new Dinero(50000),
                    fechaCierre
                );

            subasta.registrarPuja(
                "usuario1",
                1000000
            );

            (subasta as any).fechaCierre =
                new Date(
                    Date.now() - 1000
                );

            subasta.cerrar();

            expect(() => {

                subasta.registrarPuja(
                    "usuario2",
                    1100000
                );

            }).toThrow(
                "RN-06"
            );

        }
    );

});


describe("RN-08", () => {

    // La primera oferta no puede ser inferior al precio base.
    test(
        "rechaza primera puja inferior al precio base",
        () => {

            const fechaCierre =
                new Date(
                    Date.now() +
                    86400000
                );

            const subasta =
                new Subasta(
                    "Laptop Gamer",
                    "vendedor1",
                    new Dinero(1000000),
                    new Dinero(50000),
                    fechaCierre
                );

            expect(() => {

                subasta.registrarPuja(
                    "usuario2",
                    500000
                );

            }).toThrow(
                "RN-08"
            );

        }
    );

});

describe("RN-07", () => {

    // El vendedor no puede participar como postor en su propia subasta.
    test(
        "rechaza al vendedor pujando en su propia subasta",
        () => {

            const fechaCierre =
                new Date(
                    Date.now() + 86400000
                );

            const subasta =
                new Subasta(
                    "Laptop Gamer",
                    "vendedor1",
                    new Dinero(1000000),
                    new Dinero(50000),
                    fechaCierre
                );

            expect(() => {

                subasta.registrarPuja(
                    "vendedor1",
                    1200000
                );

            }).toThrow(
                "RN-07"
            );

        }
    );

});

describe("RN-09", () => {

    // Las pujas posteriores deben respetar el incremento mínimo configurado.
    test(
        "rechaza una puja que no supera el incremento minimo",
        () => {

            const fechaCierre =
                new Date(
                    Date.now() + 86400000
                );

            const subasta =
                new Subasta(
                    "Laptop Gamer",
                    "vendedor1",
                    new Dinero(1000000),
                    new Dinero(50000),
                    fechaCierre
                );

            subasta.registrarPuja(
                "usuario1",
                1000000
            );

            expect(() => {

                subasta.registrarPuja(
                    "usuario2",
                    1020000
                );

            }).toThrow(
                "RN-09"
            );

        }
    );

});

describe("RN-10", () => {

    // Un usuario no puede volver a ofertar mientras su puja sea la vigente.
    test(
        "rechaza que un usuario se supere a si mismo",
        () => {

            const fechaCierre =
                new Date(
                    Date.now() + 86400000
                );

            const subasta =
                new Subasta(
                    "Laptop Gamer",
                    "vendedor1",
                    new Dinero(1000000),
                    new Dinero(50000),
                    fechaCierre
                );

            subasta.registrarPuja(
                "usuario1",
                1000000
            );

            expect(() => {

                subasta.registrarPuja(
                    "usuario1",
                    1100000
                );

            }).toThrow(
                "RN-10"
            );

        }
    );

});

describe("RN-12", () => {

    // Los rechazos de puja quedan almacenados como intentos fallidos.
    test(
        "registra intentos de puja rechazados",
        () => {

            const fechaCierre =
                new Date(
                    Date.now() + 86400000
                );

            const subasta =
                new Subasta(
                    "Laptop Gamer",
                    "vendedor1",
                    new Dinero(1000000),
                    new Dinero(50000),
                    fechaCierre
                );

            try {

                subasta.registrarPuja(
                    "usuario1",
                    500000
                );

            } catch {}

            expect(
                subasta
                    .obtenerIntentosFallidos()
                    .length
            ).toBe(1);

        }
    );

});

describe("RN-13", () => {

    // Al cerrar una subasta con ofertas, gana el usuario de la puja más reciente.
    test(
        "adjudica la subasta al mejor postor al cerrarse",
        () => {

            const fechaCierre =
                new Date(
                    Date.now() + 86400000
                );

            const subasta =
                new Subasta(
                    "Laptop Gamer",
                    "vendedor1",
                    new Dinero(1000000),
                    new Dinero(50000),
                    fechaCierre
                );

            subasta.registrarPuja(
                "usuario1",
                1000000
            );

            subasta.registrarPuja(
                "usuario2",
                1100000
            );

            (subasta as any).fechaCierre =
                new Date(
                    Date.now() - 1000
                );

            subasta.cerrar();

            expect(
                subasta.obtenerGanadorId()
            ).toBe(
                "usuario2"
            );

        }
    );

});

describe("RN-14", () => {

    // Una subasta vencida sin ofertas puede cerrarse sin lanzar una excepción.
    test(
        "declara desierta una subasta sin pujas",
        () => {

            const fechaCierre =
                new Date(
                    Date.now() + 86400000
                );

            const subasta =
                new Subasta(
                    "Laptop Gamer",
                    "vendedor1",
                    new Dinero(1000000),
                    new Dinero(50000),
                    fechaCierre
                );

            (subasta as any).fechaCierre =
                new Date(
                    Date.now() - 1000
                );

            expect(() => {
                subasta.cerrar();
            }).not.toThrow();

        }
    );

});

describe("RN-15", () => {

    test(
        "genera una orden de pago al adjudicar la subasta",
        () => {

            const fechaCierre =
                new Date(
                    Date.now() + 86400000
                );

            const subasta =
                new Subasta(
                    "Laptop Gamer",
                    "vendedor1",
                    new Dinero(1000000),
                    new Dinero(50000),
                    fechaCierre
                );

            subasta.registrarPuja(
                "usuario1",
                1000000
            );

            (subasta as any).fechaCierre =
                new Date(
                    Date.now() - 1000
                );

            subasta.cerrar();

            expect(
                subasta.obtenerOrdenPago()
            ).not.toBeNull();

        }
    );

});

describe("RN-16", () => {

    // Una vez cerrada, la subasta no admite un segundo cierre.
    test(
        "impide cerrar una subasta dos veces",
        () => {

            const fechaCierre =
                new Date(
                    Date.now() + 86400000
                );

            const subasta =
                new Subasta(
                    "Laptop Gamer",
                    "vendedor1",
                    new Dinero(1000000),
                    new Dinero(50000),
                    fechaCierre
                );

            (subasta as any).fechaCierre =
                new Date(
                    Date.now() - 1000
                );

            subasta.registrarPuja(
                "usuario1",
                1000000
            );

            subasta.cerrar();

            expect(() => {

                subasta.cerrar();

            }).toThrow(
                "RN-16"
            );

        }
    );

});



