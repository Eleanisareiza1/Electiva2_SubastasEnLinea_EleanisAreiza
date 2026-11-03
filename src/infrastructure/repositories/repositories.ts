// Crea la instancia compartida del repositorio MongoDB usada por los controladores.
import { MongoSubastaRepository }
from "./MongoSubastaRepository";

export const subastaRepository =
    new MongoSubastaRepository();