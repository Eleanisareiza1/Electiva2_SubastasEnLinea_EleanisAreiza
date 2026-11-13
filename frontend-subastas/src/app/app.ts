import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Avisos } from './compartido/avisos';
import { Encabezado } from './diseno/encabezado';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Encabezado, Avisos],
  template: `
    <app-encabezado />
    <main><router-outlet /></main>
    <footer class="pie">
      <div class="contenedor">Plataforma de Subastas en Línea · Electiva II · Eleanis Areiza López</div>
    </footer>
    <app-avisos />
  `,
  styles: `
    :host { display: flex; flex-direction: column; min-height: 100vh; }
    main { flex: 1; }
    .pie { background: var(--azul-900); color: #94a3b8; font-size: 13px; padding: 18px 0; margin-top: 40px; }
  `
})
export class App {}
