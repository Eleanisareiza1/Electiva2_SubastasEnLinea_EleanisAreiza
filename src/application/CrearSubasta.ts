// Define el caso de uso encargado de crear una nueva subasta.
// Recibe los datos, crea la entidad y la guarda en el repositorio.

// Importa la clase Subasta desde la capa de dominio.
import { Subasta } from "../domain/Subasta";

// Importa el contrato del repositorio de subastas.
import { SubastaRepository } from "../domain/subastaRepository";

// Define la estructura de datos necesaria para crear una subasta.
interface CrearSubastaDTO {

    // Título o nombre de la subasta.
    titulo: string;

    // Precio inicial de la subasta.
    precioBase: number;

    // Incremento mínimo entre pujas.
    incrementoMinimo: number;

    // Fecha y hora en que finalizará la subasta.
    fechaCierre: Date;
}

// Declara y exporta la clase CrearSubasta.
export class CrearSubasta {

    // Constructor de la clase.
    constructor(
        // Recibe el repositorio donde se almacenará la subasta.
        // "private" permite usarlo solo dentro de esta clase.
        // "readonly" impide cambiarlo después de asignarlo.
        private readonly repository: SubastaRepository
    ) {}

    // Declara el método ejecutar.
    // Recibe los datos necesarios para crear la subasta.
    // Devuelve la subasta creada.
    ejecutar(datos: CrearSubastaDTO): Subasta {

        // Crea una nueva instancia de la entidad Subasta.
        // El constructor también valida las reglas de negocio.
        const subasta = new Subasta(
            datos.titulo,
            datos.precioBase,
            datos.incrementoMinimo,
            datos.fechaCierre
        );

        // Guarda la subasta creada en el repositorio.
        this.repository.guardar(subasta);

        // Devuelve la subasta creada.
        return subasta;
    }
}