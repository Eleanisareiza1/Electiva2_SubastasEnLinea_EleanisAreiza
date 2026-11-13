import { ErrorDominio } from "./errors/ErrorDominio";
import { Correo } from "./valueObjects/Correo";

// Persona registrada: puede actuar como vendedor, como postor o como ambos.
// Solo guarda el hash de la contraseña, nunca la contraseña (RNF-16).
export class Usuario {

    private constructor(
        public readonly id: string,
        public readonly nombre: string,
        public readonly correo: Correo,
        public readonly passwordHash: string,
        public readonly fechaRegistro: Date
    ) {}

    static registrar(datos: {
        id: string;
        nombre: string;
        correo: Correo;
        passwordHash: string;
        ahora?: Date;
    }): Usuario {

        const nombre = (datos.nombre ?? "").trim();

        if (nombre.length < 2 || nombre.length > 80) {
            throw new ErrorDominio(
                "NOMBRE_INVALIDO",
                "El nombre debe tener entre 2 y 80 caracteres",
                "VALIDACION"
            );
        }

        if (!datos.passwordHash) {
            throw new ErrorDominio(
                "RNF-16",
                "La contraseña debe almacenarse cifrada",
                "VALIDACION"
            );
        }

        return new Usuario(
            datos.id,
            nombre,
            datos.correo,
            datos.passwordHash,
            datos.ahora ?? new Date()
        );
    }

    // Restaura un usuario guardado sin repetir las validaciones de registro.
    static reconstruir(datos: {
        id: string;
        nombre: string;
        correo: string;
        passwordHash: string;
        fechaRegistro: Date;
    }): Usuario {

        return new Usuario(
            datos.id,
            datos.nombre,
            new Correo(datos.correo),
            datos.passwordHash,
            datos.fechaRegistro
        );
    }

}
