//Estamos creando un repositorio de subastas en memoria y exportándolo para que pueda ser utilizado en otras partes de la aplicación.

import { InMemorySubastaRepository } from "./InMemorySubastaRepository";

export const subastaRepository =
    new InMemorySubastaRepository();