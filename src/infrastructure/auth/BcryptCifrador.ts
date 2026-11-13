import bcrypt from "bcrypt";
import { CifradorContrasenas } from "../../application/ports/CifradorContrasenas";

const RONDAS = 10;

// Adaptador del puerto CifradorContrasenas con bcrypt (RNF-16).
export class BcryptCifrador implements CifradorContrasenas {

    cifrar(contrasena: string): Promise<string> {
        return bcrypt.hash(contrasena, RONDAS);
    }

    comparar(contrasena: string, hash: string): Promise<boolean> {
        return bcrypt.compare(contrasena, hash);
    }

}
