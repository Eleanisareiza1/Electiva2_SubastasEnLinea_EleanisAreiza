// Puerto de salida para notificar eventos de subasta sin acoplar la aplicación a Socket.IO.
export interface NotificacionPort {
    // Avisa que la subasta identificada ha finalizado.
    notificarSubastaCerrada(indiceSubasta: number): unknown;

    // Publica el importe de una nueva puja.
    notificarNuevaPuja(
        indiceSubasta: number,
        valor: number
    ): void;

    // Avisa al postor indicado que su oferta fue superada.
    notificarUsuarioSuperado(
    indiceSubasta: number,
    usuarioId: string
): void;


}
