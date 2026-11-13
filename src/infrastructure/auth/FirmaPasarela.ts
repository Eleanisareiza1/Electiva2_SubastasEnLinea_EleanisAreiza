import { createHmac, timingSafeEqual } from "crypto";

// Contrato con la pasarela: cada notificación llega con la cabecera
//   x-pasarela-firma: sha256=<HMAC-SHA256 del cuerpo crudo con WEBHOOK_SECRET>
export const CABECERA_FIRMA = "x-pasarela-firma";

export function firmarCuerpo(cuerpo: string | Buffer, secreto: string): string {
    return "sha256=" + createHmac("sha256", secreto).update(cuerpo).digest("hex");
}

// RN-18: verifica el origen comparando en tiempo constante.
export function firmaValida(cuerpo: Buffer, firmaRecibida: string | undefined, secreto: string): boolean {

    if (!firmaRecibida) {
        return false;
    }

    const esperada = Buffer.from(firmarCuerpo(cuerpo, secreto));
    const recibida = Buffer.from(firmaRecibida);

    return esperada.length === recibida.length && timingSafeEqual(esperada, recibida);
}
