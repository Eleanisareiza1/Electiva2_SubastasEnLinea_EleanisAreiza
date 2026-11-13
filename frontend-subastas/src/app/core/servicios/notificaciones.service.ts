import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notificacion, RespuestaApi } from '../modelos';
import { AvisosService } from './avisos.service';
import { SesionService } from './sesion.service';
import { TiempoRealService } from './tiempo-real.service';

// Bandeja de notificaciones del usuario, alimentada por la API y por WebSocket.
@Injectable({ providedIn: 'root' })
export class NotificacionesService {

  private readonly http = inject(HttpClient);
  private readonly sesion = inject(SesionService);
  private readonly avisos = inject(AvisosService);

  readonly lista = signal<Notificacion[]>([]);
  readonly sinLeer = computed(() => this.lista().filter((n) => !n.leida).length);

  constructor() {
    const tiempoReal = inject(TiempoRealService);

    effect(() => {
      if (this.sesion.autenticado()) {
        void this.cargar();
      } else {
        this.lista.set([]);
      }
    });

    tiempoReal.notificacion$.subscribe((n) => {
      this.lista.update((actual) => [n, ...actual.filter((x) => x.id !== n.id)]);
      this.avisos.mostrar(n.mensaje, n.tipo === 'PUJA_SUPERADA' || n.tipo === 'ORDEN_VENCIDA' ? 'alerta' : 'info');
    });
  }

  async cargar(): Promise<void> {
    try {
      const datos = await firstValueFrom(
        this.http.get<RespuestaApi<Notificacion[]>>(`${environment.apiUrl}/notificaciones`).pipe(map((r) => r.data))
      );
      this.lista.set(datos);
    } catch {
      // Si falla se mantiene la lista actual; el interceptor maneja la sesión expirada.
    }
  }

  async marcarLeida(id: string): Promise<void> {
    this.lista.update((l) => l.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    try {
      await firstValueFrom(this.http.patch(`${environment.apiUrl}/notificaciones/${id}/leida`, {}));
    } catch {
      // sin acción
    }
  }
}
