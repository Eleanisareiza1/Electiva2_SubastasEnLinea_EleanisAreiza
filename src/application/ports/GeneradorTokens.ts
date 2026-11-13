// Datos que viajan dentro del token de sesión.
export interface DatosSesion {
    usuarioId: string;
    correo: string;
    nombre: string;
}

// Puerto para emitir tokens de sesión sin acoplar la aplicación a JWT.
export interface GeneradorTokens {

    generar(datos: DatosSesion): string;

}
