import { randomUUID } from "crypto";
import { GeneradorIds } from "../../application/ports/GeneradorIds";

export class UuidGeneradorIds implements GeneradorIds {

    generar(): string {
        return randomUUID();
    }

}
