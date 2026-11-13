import { ErrorDominio } from "./errors/ErrorDominio";
import { TipoNotificacion } from "./valueObjects/TipoNotificacion";

// Aviso dirigido a un usuario sobre un hecho relevante para él.
export class Notificacion {

    constructor(
        public readonly id: string,
        public readonly usuarioId: string,
        public readonly tipo: TipoNotificacion,
        public readonly mensaje: string,
        public readonly subastaId: string | null,
        public readonly fecha: Date,
        private leida: boolean = false
    ) {}

    estaLeida(): boolean {
        return this.leida;
    }

    // Solo el destinatario puede marcarla como leída.
    marcarLeida(usuarioId: string): void {

        if (usuarioId !== this.usuarioId) {
            throw new ErrorDominio(
                "NOTIFICACION_AJENA",
                "No puede modificar una notificación de otro usuario",
                "PROHIBIDO"
            );
        }

        this.leida = true;
    }

}
