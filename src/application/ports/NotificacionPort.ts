export interface NotificacionPort {

    notificarNuevaPuja(
        indiceSubasta: number,
        valor: number
    ): void;

}