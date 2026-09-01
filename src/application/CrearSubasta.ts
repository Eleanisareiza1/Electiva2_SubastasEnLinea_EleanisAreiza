//Estamos implementando un caso de uso para crear una subasta. Este caso de uso recibe los datos necesarios para crear una subasta, crea una instancia de la entidad Subasta y la guarda en el repositorio.

import { Subasta } from "../domain/Subasta";
import { SubastaRepository } from "../domain/subastaRepository";

interface CrearSubastaDTO {
    titulo: string;
    precioBase: number;
    incrementoMinimo: number;
    fechaCierre: Date;
}

export class CrearSubasta {

    constructor(
        private readonly repository: SubastaRepository
    ) {}

    ejecutar(datos: CrearSubastaDTO): Subasta {

        const subasta = new Subasta(
            datos.titulo,
            datos.precioBase,
            datos.incrementoMinimo,
            datos.fechaCierre
        );

        this.repository.guardar(subasta);

        return subasta;
    }

}