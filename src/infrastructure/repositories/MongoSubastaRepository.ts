// Indica que este archivo implementa un repositorio de subastas en memoria.
// Los datos se almacenan temporalmente mientras la aplicación está ejecutándose.

// Importa la clase o tipo Subasta desde la capa de dominio.
import { Subasta } from "../../domain/Subasta";

// Importa la interfaz que define las operaciones del repositorio.
import { SubastaRepository } from "../../domain/subastaRepository";

// Declara y exporta la clase InMemorySubastaRepository.
// "export" permite utilizar esta clase desde otros archivos.
export class InMemorySubastaRepository

    // Indica que esta clase debe cumplir el contrato definido por SubastaRepository.
    implements SubastaRepository {

    // Declara una propiedad privada llamada subastas.
    // Solo puede utilizarse dentro de esta clase.
    // Es un arreglo que almacenará objetos de tipo Subasta.
    // Se inicializa como un arreglo vacío.
    private subastas: Subasta[] = [];

    // Declara el método guardar.
    // Recibe una subasta como parámetro.
    // El tipo void indica que no devuelve ningún valor.
    guardar(subasta: Subasta): void {
        // Agrega la subasta recibida al final del arreglo subastas.
        this.subastas.push(subasta);
    }

    // Declara el método obtenerTodas.
    // Devuelve un arreglo que contiene todas las subastas almacenadas.
    obtenerTodas(): Subasta[] {
        // Retorna el arreglo interno de subastas.
        return this.subastas;
    }

// Cierra la definición de la clase.
}  