import { Subasta } from "../domain/Subasta";
import { Dinero } from "../domain/valueObjects/Dinero";


describe("RN-08", () => {

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

describe("RN-14", () => {

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

describe("RN-16", () => {

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

describe("RN-12", () => {

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