// Este archivo crea un repositorio de subastas almacenado en memoria.
// También permite exportarlo para utilizarlo en otras partes de la aplicación.

// Importa la clase InMemorySubastaRepository desde el archivo correspondiente.
// Esta clase contiene la lógica para guardar y consultar subastas en memoria.
import { InMemorySubastaRepository } from "./InMemorySubastaRepository";

// Crea una constante llamada subastaRepository.
// Instancia InMemorySubastaRepository utilizando la palabra clave "new".
// La instancia se utilizará como repositorio central de subastas.
export const subastaRepository =
    new InMemorySubastaRepository();