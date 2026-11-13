import { Injectable, signal } from '@angular/core';

export type TipoAviso = 'exito' | 'error' | 'info' | 'alerta';

export interface Aviso {
  id: number;
  mensaje: string;
  tipo: TipoAviso;
}

// Avisos emergentes (toasts) para comunicar resultados y errores.
@Injectable({ providedIn: 'root' })
export class AvisosService {

  private siguiente = 1;
  readonly avisos = signal<Aviso[]>([]);

  mostrar(mensaje: string, tipo: TipoAviso = 'info', duracionMs = 5000): void {
    const aviso = { id: this.siguiente++, mensaje, tipo };
    this.avisos.update((lista) => [...lista, aviso].slice(-4));
    setTimeout(() => this.cerrar(aviso.id), duracionMs);
  }

  cerrar(id: number): void {
    this.avisos.update((lista) => lista.filter((a) => a.id !== id));
  }
}
