//Estamos diciendole al domicio que necesitamos guardar y obtener subastas que podria ser en "memoria",
// "mongoDB","PostgreSQL","ArchivoJson". 

// Indica que este archivo define un contrato para almacenar y consultar subastas.
// La implementación concreta podría utilizar memoria, MongoDB, PostgreSQL o un archivo JSON.

// Importa la clase o tipo Subasta desde el archivo Subasta.ts.
import { Subasta } from "./Subasta";

// Declara la interfaz SubastaRepository.
// Una interfaz define las operaciones que cualquier repositorio de subastas debe implementar.
export interface SubastaRepository {

    // Declara el método guardar.
    // Recibe una subasta como parámetro y no devuelve ningún valor.
    guardar(subasta: Subasta): void;

    // Declara el método obtenerTodas.
    // Devuelve un arreglo con todas las subastas almacenadas.
    obtenerTodas(): Subasta[];

// Cierra la definición de la interfaz.
}
