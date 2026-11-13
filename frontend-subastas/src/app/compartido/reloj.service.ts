import { Injectable, signal } from '@angular/core';

// Un único reloj compartido que avanza cada segundo para todas las cuentas regresivas.
@Injectable({ providedIn: 'root' })
export class RelojService {
  readonly ahora = signal(Date.now());

  constructor() {
    setInterval(() => this.ahora.set(Date.now()), 1000);
  }
}
