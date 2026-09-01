//Estamos creando un caso de uso. El controlador delega la creación de subastas a este caso de uso. El caso de uso se encarga de crear la subasta y devolverla al controlador para que este la devuelva al cliente.

import { Subasta } from "../domain/Subasta";

interface CrearSubastaDTO {
    titulo: string;
    precioBase: number;
    incrementoMinimo: number;
    fechaCierre: Date;
}

export class CrearSubasta {

    ejecutar(datos: CrearSubastaDTO): Subasta {

        const subasta = new Subasta(
            datos.titulo,
            datos.precioBase,
            datos.incrementoMinimo,
            datos.fechaCierre
        );

        return subasta;
    }

}