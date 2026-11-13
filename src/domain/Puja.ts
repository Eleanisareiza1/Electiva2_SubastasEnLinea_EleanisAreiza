import { Dinero } from "./valueObjects/Dinero";

// Oferta aceptada dentro de una subasta. Es irrevocable (RN-11): no tiene
// métodos para modificarse ni existe operación para retirarla.
export class Puja {

    constructor(
        public readonly postorId: string,
        public readonly valor: Dinero,
        public readonly fecha: Date
    ) {}

}
