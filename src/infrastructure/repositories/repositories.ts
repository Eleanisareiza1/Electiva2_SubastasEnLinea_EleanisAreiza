import { MongoSubastaRepository }
from "./MongoSubastaRepository";

import { MongoUsuarioRepository }
from "./MongoUsuarioRepository";

export const subastaRepository =
    new MongoSubastaRepository();

export const usuarioRepository =
    new MongoUsuarioRepository();