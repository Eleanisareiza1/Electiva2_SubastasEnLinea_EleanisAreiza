import { ErrorDominio } from "../../domain/errors/ErrorDominio";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { Correo } from "../../domain/valueObjects/Correo";
import { CifradorContrasenas } from "../ports/CifradorContrasenas";
import { GeneradorTokens } from "../ports/GeneradorTokens";
import { UsuarioVista, aVistaUsuario } from "../services/Vistas";

export interface IniciarSesionDTO {
    correo: string;
    password: string;
}

export interface SesionIniciada {
    token: string;
    usuario: UsuarioVista;
}

// RF-02: inicio de sesión que entrega un token.
export class IniciarSesion {

    constructor(
        private readonly usuarios: UsuarioRepository,
        private readonly cifrador: CifradorContrasenas,
        private readonly tokens: GeneradorTokens
    ) {}

    async ejecutar(datos: IniciarSesionDTO): Promise<SesionIniciada> {

        const credencialesInvalidas = new ErrorDominio(
            "CREDENCIALES_INVALIDAS",
            "Correo o contraseña incorrectos",
            "NO_AUTENTICADO"
        );

        let correo: Correo;
        try {
            correo = new Correo(datos.correo);
        } catch {
            throw credencialesInvalidas;
        }

        const usuario = await this.usuarios.buscarPorCorreo(correo);

        if (!usuario || !(await this.cifrador.comparar(datos.password, usuario.passwordHash))) {
            throw credencialesInvalidas;
        }

        const token = this.tokens.generar({
            usuarioId: usuario.id,
            correo: usuario.correo.obtenerValor(),
            nombre: usuario.nombre
        });

        console.log(`[negocio] Inicio de sesión: ${usuario.id}`);

        return { token, usuario: aVistaUsuario(usuario) };
    }

}
