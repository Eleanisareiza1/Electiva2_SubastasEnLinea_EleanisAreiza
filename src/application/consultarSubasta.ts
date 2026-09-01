//Estamos creando un caso de uso para consultar todas las subastas disponibles en el repositorio.
// No dejamos que el controlador acceda directamente al repositorio, sino que delegamos la responsabilidad de obtener las subastas a este caso de uso.

import { Subasta } from "../domain/Subasta";
import { SubastaRepository } from "../domain/subastaRepository";

export class ConsultarSubastas {

    constructor(
        private readonly repository: SubastaRepository
    ) {}

    ejecutar(): Subasta[] {
        return this.repository.obtenerTodas();
    }

}