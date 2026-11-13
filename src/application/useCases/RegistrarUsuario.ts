import { Usuario } from "../../domain/Usuario";
import { ErrorDominio } from "../../domain/errors/ErrorDominio";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { Correo } from "../../domain/valueObjects/Correo";
import { CifradorContrasenas } from "../ports/CifradorContrasenas";
import { GeneradorIds } from "../ports/GeneradorIds";
import { UsuarioVista, aVistaUsuario } from "../services/Vistas";

export interface RegistrarUsuarioDTO {
    nombre: string;
    correo: string;
    password: string;
}

// RF-01: registro con nombre, correo y contraseña.
export class RegistrarUsuario {

    constructor(
        private readonly usuarios: UsuarioRepository,
        private readonly cifrador: CifradorContrasenas,
        private readonly ids: GeneradorIds
    ) {}

    async ejecutar(datos: RegistrarUsuarioDTO): Promise<UsuarioVista> {

        const correo = new Correo(datos.correo);

        // RN-22: el correo es único dentro de la plataforma.
        if (await this.usuarios.buscarPorCorreo(correo)) {
            throw new ErrorDominio(
                "RN-22",
                "Ya existe un usuario registrado con ese correo",
                "CONFLICTO"
            );
        }

        // RNF-16: solo se guarda el hash.
        const passwordHash = await this.cifrador.cifrar(datos.password);

        const usuario = Usuario.registrar({
            id: this.ids.generar(),
            nombre: datos.nombre,
            correo,
            passwordHash
        });

        await this.usuarios.guardar(usuario);

        console.log(`[negocio] Usuario registrado: ${usuario.id}`);

        return aVistaUsuario(usuario);
    }

}
