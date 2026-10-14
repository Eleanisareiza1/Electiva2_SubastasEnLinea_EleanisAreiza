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