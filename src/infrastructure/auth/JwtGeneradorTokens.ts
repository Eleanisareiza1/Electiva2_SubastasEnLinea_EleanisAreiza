import jwt, { SignOptions } from "jsonwebtoken";
import { DatosSesion, GeneradorTokens } from "../../application/ports/GeneradorTokens";

const EMISOR = "subastas-en-linea";

// Adaptador del puerto GeneradorTokens con JSON Web Tokens.
export class JwtGeneradorTokens implements GeneradorTokens {

    constructor(
        private readonly secreto: string,
        private readonly expiracion: string
    ) {}

    generar(datos: DatosSesion): string {
        const opciones: SignOptions = {
            algorithm: "HS256",
            issuer: EMISOR,
            subject: datos.usuarioId,
            expiresIn: this.expiracion as SignOptions["expiresIn"]
        };
        return jwt.sign({ correo: datos.correo, nombre: datos.nombre }, this.secreto, opciones);
    }

    // Lo usan el middleware HTTP y el servidor de WebSockets; lanza error si no es válido.
    verificar(token: string): DatosSesion {

        const payload = jwt.verify(token, this.secreto, {
            algorithms: ["HS256"],
            issuer: EMISOR
        });

        if (
            typeof payload === "string" ||
            typeof payload.sub !== "string" ||
            typeof payload.correo !== "string" ||
            typeof payload.nombre !== "string"
        ) {
            throw new Error("Token con formato inválido");
        }

        return { usuarioId: payload.sub, correo: payload.correo, nombre: payload.nombre };
    }

}
