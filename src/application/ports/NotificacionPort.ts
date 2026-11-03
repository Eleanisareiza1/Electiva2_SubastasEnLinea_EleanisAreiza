export interface NotificacionPort {
    notificarSubastaCerrada(indiceSubasta: number): unknown;

    notificarNuevaPuja(
        indiceSubasta: number,
        valor: number
    ): void;

    notificarUsuarioSuperado(
    indiceSubasta: number,
    usuarioId: string
): void;


}

