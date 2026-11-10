export class Usuario {

    constructor(
        public readonly nombre: string,
        public readonly correo: string,
        public readonly passwordHash: string
    ) {}

}