// Define un caso de uso para consultar todas las subastas disponibles.
// El controlador utiliza este caso de uso en lugar de acceder directamente al repositorio.

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

    // Declara el método ejecutar.
    // Este método realiza la consulta de todas las subastas.
    // Devuelve un arreglo de objetos Subasta.
    ejecutar(): Subasta[] {
        // Solicita al repositorio todas las subastas almacenadas.
        // Retorna el resultado al código que llamó al caso de uso.
        return this.repository.obtenerTodas();
    }
}