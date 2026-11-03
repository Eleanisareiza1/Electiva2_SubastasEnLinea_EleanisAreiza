// Caso de uso que transforma los datos de entrada en una entidad y la persiste.

// Importa la clase Subasta desde la capa de dominio.
import { Subasta } from "../domain/Subasta";
import { Dinero } from "../domain/valueObjects/Dinero";
// Importa el contrato del repositorio de subastas.
import { SubastaRepository } from "../domain/subastaRepository";

// Datos requeridos para crear una subasta desde la capa de aplicación.
interface CrearSubastaDTO {
    vendedorId: string;
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

    // Construye la entidad (que aplica sus validaciones), la guarda y la devuelve.
    async ejecutar(datos: CrearSubastaDTO ): Promise<Subasta> {
        // Crea una nueva instancia de la entidad Subasta.
        // El constructor también valida las reglas de negocio.
        const subasta = new Subasta(
            datos.titulo,
            datos.vendedorId,
            new Dinero(datos.precioBase),
            new Dinero(datos.incrementoMinimo),
            datos.fechaCierre
        );
        // Guarda la subasta creada en el repositorio.
        await this.repository.guardar(subasta);
        // Devuelve la subasta creada.
        return subasta;
    }
}