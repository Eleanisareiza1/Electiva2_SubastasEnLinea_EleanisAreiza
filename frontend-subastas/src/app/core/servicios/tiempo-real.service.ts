import { Injectable, effect, inject, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { EventoCambioEstado, EventoNuevaPuja, EventoParticipantes, Notificacion } from '../modelos';
import { SesionService } from './sesion.service';

// Conexión de WebSocket: el servidor informa sin que el cliente pregunte.
@Injectable({ providedIn: 'root' })
export class TiempoRealService {

  private readonly sesion = inject(SesionService);
  private socket: Socket | null = null;
  private readonly subastasSuscritas = new Set<string>();
  private listadoSuscrito = false;

  readonly conectado = signal(false);

  private readonly nuevaPujaSubject = new Subject<EventoNuevaPuja>();
  private readonly estadoSubject = new Subject<EventoCambioEstado>();
  private readonly participantesSubject = new Subject<EventoParticipantes>();
  private readonly notificacionSubject = new Subject<Notificacion>();

  readonly nuevaPuja$: Observable<EventoNuevaPuja> = this.nuevaPujaSubject.asObservable();
  readonly cambioEstado$: Observable<EventoCambioEstado> = this.estadoSubject.asObservable();
  readonly participantes$: Observable<EventoParticipantes> = this.participantesSubject.asObservable();
  readonly notificacion$: Observable<Notificacion> = this.notificacionSubject.asObservable();

  constructor() {
    // Se conecta al iniciar sesión y se desconecta al cerrarla.
    effect(() => {
      if (this.sesion.autenticado()) {
        this.conectar();
      } else {
        this.desconectar();
      }
    });
  }

  suscribirSubasta(id: string): void {
    this.subastasSuscritas.add(id);
    this.socket?.emit('suscribirse-subasta', id);
  }

  desuscribirSubasta(id: string): void {
    this.subastasSuscritas.delete(id);
    this.socket?.emit('desuscribirse-subasta', id);
  }

  suscribirListado(): void {
    this.listadoSuscrito = true;
    this.socket?.emit('suscribirse-listado');
  }

  desuscribirListado(): void {
    this.listadoSuscrito = false;
    this.socket?.emit('desuscribirse-listado');
  }

  private conectar(): void {
    if (this.socket) {
      return;
    }

    this.socket = io(environment.socketUrl, {
      auth: (cb) => cb({ token: this.sesion.token() }),
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      this.conectado.set(true);
      // Al reconectar se restauran las suscripciones.
      this.subastasSuscritas.forEach((id) => this.socket?.emit('suscribirse-subasta', id));
      if (this.listadoSuscrito) {
        this.socket?.emit('suscribirse-listado');
      }
    });
    this.socket.on('disconnect', () => this.conectado.set(false));
    this.socket.on('connect_error', () => this.conectado.set(false));

    this.socket.on('nueva-puja', (e: EventoNuevaPuja) => this.nuevaPujaSubject.next(e));
    this.socket.on('subasta-estado', (e: EventoCambioEstado) => this.estadoSubject.next(e));
    this.socket.on('participantes', (e: EventoParticipantes) => this.participantesSubject.next(e));
    this.socket.on('notificacion', (e: Notificacion) => this.notificacionSubject.next(e));
  }

  private desconectar(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.conectado.set(false);
  }
}
