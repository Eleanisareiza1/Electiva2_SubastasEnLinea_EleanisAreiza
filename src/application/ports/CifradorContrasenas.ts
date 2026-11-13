// Puerto para cifrar y comparar contraseñas sin acoplar la aplicación a bcrypt.
export interface CifradorContrasenas {

    cifrar(contrasena: string): Promise<string>;

    comparar(contrasena: string, hash: string): Promise<boolean>;

}
