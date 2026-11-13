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
  templateUrl: './imagen-articulo.html',
  styleUrl: './imagen-articulo.css'
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
