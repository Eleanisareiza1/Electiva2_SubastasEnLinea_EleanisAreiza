// Raíz de composición: el único lugar que conoce qué adaptador implementa cada puerto.
// Cambiar de MongoDB a memoria solo cambia este archivo (RNF-06).

import { CifradorContrasenas } from "../application/ports/CifradorContrasenas";
import { GeneradorIds } from "../application/ports/GeneradorIds";
import { GeneradorTokens } from "../application/ports/GeneradorTokens";
import { NotificacionPort } from "../application/ports/NotificacionPort";
import { AvisadorNegocio } from "../application/services/AvisadorNegocio";
import { ConstructorContexto } from "../application/services/ConstructorContexto";
import { SincronizadorSubastas } from "../application/services/SincronizadorSubastas";
import { CancelarSubasta } from "../application/useCases/CancelarSubasta";
import { ConsultarDetalleSubasta } from "../application/useCases/ConsultarDetalleSubasta";
import { ConsultarIntentosFallidos } from "../application/useCases/ConsultarIntentosFallidos";
import { ConsultarNotificaciones } from "../application/useCases/ConsultarNotificaciones";
import { ConsultarOrdenesPago } from "../application/useCases/ConsultarOrdenesPago";
import { ConsultarPerfil } from "../application/useCases/ConsultarPerfil";
import { IniciarSesion } from "../application/useCases/IniciarSesion";
import { ListarCategorias } from "../application/useCases/ListarCategorias";
import { ListarSubastas } from "../application/useCases/ListarSubastas";
import { MarcarNotificacionLeida } from "../application/useCases/MarcarNotificacionLeida";
import { ProcesarEventoPago } from "../application/useCases/ProcesarEventoPago";
import { PublicarSubasta } from "../application/useCases/PublicarSubasta";
import { RegistrarPuja } from "../application/useCases/RegistrarPuja";
import { RegistrarUsuario } from "../application/useCases/RegistrarUsuario";
import { CategoriaRepository } from "../domain/repositories/CategoriaRepository";
import { EventoPagoRepository } from "../domain/repositories/EventoPagoRepository";
import { NotificacionRepository } from "../domain/repositories/NotificacionRepository";
import { SubastaRepository } from "../domain/repositories/SubastaRepository";
import { UsuarioRepository } from "../domain/repositories/UsuarioRepository";
import { TipoPersistencia } from "./config/entorno";
import {
    MemoriaCategoriaRepository,
    MemoriaEventoPagoRepository,
    MemoriaNotificacionRepository,
    MemoriaSubastaRepository,
    MemoriaUsuarioRepository
} from "./repositories/memoria/MemoriaRepositorios";
import {
    MongoCategoriaRepository,
    MongoEventoPagoRepository,
    MongoNotificacionRepository,
    MongoUsuarioRepository
} from "./repositories/mongo/MongoRepositorios";
import { MongoSubastaRepository } from "./repositories/mongo/MongoSubastaRepository";

export interface Repositorios {
    subastas: SubastaRepository;
    usuarios: UsuarioRepository;
    categorias: CategoriaRepository;
    eventosPago: EventoPagoRepository;
    notificaciones: NotificacionRepository;
}

export interface CasosDeUso {
    registrarUsuario: RegistrarUsuario;
    iniciarSesion: IniciarSesion;
    consultarPerfil: ConsultarPerfil;
    listarCategorias: ListarCategorias;
    publicarSubasta: PublicarSubasta;
    listarSubastas: ListarSubastas;
    consultarDetalle: ConsultarDetalleSubasta;
    cancelarSubasta: CancelarSubasta;
    registrarPuja: RegistrarPuja;
    consultarIntentosFallidos: ConsultarIntentosFallidos;
    consultarOrdenes: ConsultarOrdenesPago;
    procesarEventoPago: ProcesarEventoPago;
    consultarNotificaciones: ConsultarNotificaciones;
    marcarNotificacionLeida: MarcarNotificacionLeida;
}

export async function crearRepositorios(tipo: TipoPersistencia): Promise<Repositorios> {

    if (tipo === "memoria") {
        return {
            subastas: new MemoriaSubastaRepository(),
            usuarios: new MemoriaUsuarioRepository(),
            categorias: new MemoriaCategoriaRepository(),
            eventosPago: new MemoriaEventoPagoRepository(),
            notificaciones: new MemoriaNotificacionRepository()
        };
    }

    const categorias = new MongoCategoriaRepository();
    await categorias.asegurarIniciales();

    return {
        subastas: new MongoSubastaRepository(),
        usuarios: new MongoUsuarioRepository(),
        categorias,
        eventosPago: new MongoEventoPagoRepository(),
        notificaciones: new MongoNotificacionRepository()
    };
}

export function crearCasosDeUso(
    repos: Repositorios,
    adaptadores: {
        tiempoReal: NotificacionPort;
        cifrador: CifradorContrasenas;
        tokens: GeneradorTokens;
        ids: GeneradorIds;
    }
): CasosDeUso {

    const avisador = new AvisadorNegocio(repos.notificaciones, repos.usuarios, adaptadores.tiempoReal, adaptadores.ids);
    const sincronizador = new SincronizadorSubastas(repos.subastas, avisador);
    const contexto = new ConstructorContexto(repos.usuarios, repos.categorias);

    return {
        registrarUsuario: new RegistrarUsuario(repos.usuarios, adaptadores.cifrador, adaptadores.ids),
        iniciarSesion: new IniciarSesion(repos.usuarios, adaptadores.cifrador, adaptadores.tokens),
        consultarPerfil: new ConsultarPerfil(repos.usuarios, repos.subastas, sincronizador, contexto),
        listarCategorias: new ListarCategorias(repos.categorias),
        publicarSubasta: new PublicarSubasta(repos.subastas, repos.categorias, adaptadores.ids, contexto),
        listarSubastas: new ListarSubastas(repos.subastas, sincronizador, contexto),
        consultarDetalle: new ConsultarDetalleSubasta(repos.subastas, sincronizador, contexto),
        cancelarSubasta: new CancelarSubasta(repos.subastas, sincronizador, avisador),
        registrarPuja: new RegistrarPuja(repos.subastas, sincronizador, avisador),
        consultarIntentosFallidos: new ConsultarIntentosFallidos(repos.subastas, repos.usuarios),
        consultarOrdenes: new ConsultarOrdenesPago(repos.subastas, sincronizador),
        procesarEventoPago: new ProcesarEventoPago(repos.subastas, repos.eventosPago, avisador),
        consultarNotificaciones: new ConsultarNotificaciones(repos.notificaciones),
        marcarNotificacionLeida: new MarcarNotificacionLeida(repos.notificaciones)
    };
}
