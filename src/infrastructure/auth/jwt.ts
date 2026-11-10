import jwt from "jsonwebtoken";

const SECRET =
    process.env.JWT_SECRET ||
    "secret";

export function generarToken(
    correo: string
): string {

    return jwt.sign(
        { correo },
        SECRET,
        {
            expiresIn: "24h"
        }
    );

}

export function verificarToken(
    token: string
): any {

    return jwt.verify(
        token,
        SECRET
    );

}
