import { DatePipe } from '@angular/common';
import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Notificacion } from '../../core/modelos';
import { NotificacionesService } from '../../core/servicios/notificaciones.service';
import { SesionService } from '../../core/servicios/sesion.service';
import { TiempoRealService } from '../../core/servicios/tiempo-real.service';

@Component({
  selector: 'app-encabezado',
  imports: [RouterLink, RouterLinkActive, FormsModule, DatePipe],
  templateUrl: './encabezado.html',
  styleUrl: './encabezado.css'
})
export class Encabezado {

  readonly sesion = inject(SesionService);
  readonly notificaciones = inject(NotificacionesService);
  readonly tiempoReal = inject(TiempoRealService);
  private readonly router = inject(Router);
  private readonly elemento = inject(ElementRef<HTMLElement>);

  readonly busqueda = signal('');
  readonly panel = signal<'notificaciones' | 'usuario' | null>(null);
  readonly iniciales = computed(() =>
    (this.sesion.usuario()?.nombre ?? '?')
      .split(' ')
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('')
  );

  buscar(): void {
    void this.router.navigate(['/subastas'], { queryParams: { texto: this.busqueda() || null, pagina: null } });
  }

  alternar(panel: 'notificaciones' | 'usuario'): void {
    this.panel.update((actual) => (actual === panel ? null : panel));
  }

  abrir(n: Notificacion): void {
    void this.notificaciones.marcarLeida(n.id);
    this.panel.set(null);
    if (n.subastaId) {
      void this.router.navigate(['/subastas', n.subastaId]);
    }
  }

  salir(): void {
    this.panel.set(null);
    this.sesion.cerrarSesion();
  }

  @HostListener('document:click', ['$event'])
  cerrarAlHacerClicFuera(evento: MouseEvent): void {
    if (!this.elemento.nativeElement.contains(evento.target as Node)) {
      this.panel.set(null);
    }
  }
}
