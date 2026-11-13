import { Component, computed, input, signal } from '@angular/core';

// Ícono y colores por categoría cuando el artículo no tiene foto.
const ESTILOS: Record<string, { fondo: string; icono: string }> = {
  vehiculos: { fondo: 'linear-gradient(135deg,#1d3f99,#2f6fed)', icono: 'M5 16l1.5-5A2 2 0 0 1 8.4 9.6h7.2a2 2 0 0 1 1.9 1.4L19 16M4 16h16v3H4zM7 19v1.5M17 19v1.5M7.5 13.5h.01M16.5 13.5h.01' },
  tecnologia: { fondo: 'linear-gradient(135deg,#0f766e,#14b8a6)', icono: 'M4 6h16v10H4zM2 19h20M9 16v3M15 16v3' },
  hogar: { fondo: 'linear-gradient(135deg,#b45309,#f59e0b)', icono: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6' },
  moda: { fondo: 'linear-gradient(135deg,#be185d,#f472b6)', icono: 'M8 3l4 3 4-3 5 4-3 3v11H6V10L3 7z' },
  arte: { fondo: 'linear-gradient(135deg,#6d28d9,#a78bfa)', icono: 'M4 4h16v16H4zM4 15l5-5 4 4 3-3 4 4M15 8.5h.01' },
  deportes: { fondo: 'linear-gradient(135deg,#c2410c,#fb923c)', icono: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3.5 9h17M3.5 15h17M12 3v18' }
};
const POR_DEFECTO = { fondo: 'linear-gradient(135deg,#334155,#64748b)', icono: 'M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10' };

@Component({
  selector: 'app-imagen-articulo',
  template: `
    <div class="marco" [style.background]="!mostrarFoto() ? estilo().fondo : null" [class.grande]="grande()">
      @if (mostrarFoto()) {
        <img [src]="url()" [alt]="titulo()" loading="lazy" (error)="fallo.set(true)" />
      } @else {
        <svg viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="estilo().icono" /></svg>
        <span>{{ categoria() }}</span>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .marco { position: relative; width: 100%; aspect-ratio: 4 / 3; border-radius: 10px; overflow: hidden;
      display: grid; place-items: center; align-content: center; gap: 6px; color: rgba(255,255,255,.95); }
    .marco img { width: 100%; height: 100%; object-fit: cover; }
    .marco svg { width: 42%; max-width: 72px; fill: none; stroke: currentColor; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
    .marco span { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; opacity: .85; }
    .grande { aspect-ratio: 16 / 9; max-height: 440px; border-radius: 16px; }
    .grande svg { max-width: 140px; }
    .grande span { font-size: 14px; }
  `
})
export class ImagenArticulo {
  readonly url = input<string | null>(null);
  readonly titulo = input('');
  readonly categoriaId = input('');
  readonly categoria = input('');
  readonly grande = input(false);

  readonly fallo = signal(false);
  readonly mostrarFoto = computed(() => !!this.url() && !this.fallo());
  readonly estilo = computed(() => ESTILOS[this.categoriaId()] ?? POR_DEFECTO);
}
