// Caso de uso que obtiene todas las subastas a través del contrato del repositorio.

// Importa la clase Subasta para indicar el tipo de datos que se devolverá.
import { Subasta } from "../domain/Subasta";

// Importa la interfaz del repositorio de subastas.
// Esto permite trabajar con cualquier implementación del repositorio.
import { SubastaRepository } from "../domain/subastaRepository";

// Declara y exporta la clase ConsultarSubastas.
// "export" permite utilizar esta clase desde otros archivos.
export class ConsultarSubastas {

    // Constructor de la clase.
    constructor(
        // Recibe un repositorio que cumple el contrato SubastaRepository.
        // "private" limita el acceso a la propiedad dentro de esta clase.
        // "readonly" impide reasignar el repositorio después de crearlo.
        private readonly repository: SubastaRepository
    ) {}

    // Recupera las subastas y devuelve la colección al controlador solicitante.
    async ejecutar():
    Promise<Subasta[]>
{
        // Solicita al repositorio todas las subastas almacenadas.
        // Retorna el resultado al código que llamó al caso de uso.
        return await this.repository.obtenerTodas();
    }
}