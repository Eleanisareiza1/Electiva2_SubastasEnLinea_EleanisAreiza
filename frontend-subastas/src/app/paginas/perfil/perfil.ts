import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AlertaError } from '../../compartido/alerta-error';
import { CuentaRegresiva } from '../../compartido/cuenta-regresiva';
import { EstadoSubastaInsignia } from '../../compartido/estado-subasta';
import { ImagenArticulo } from '../../compartido/imagen-articulo';
import { PesosPipe } from '../../compartido/pesos.pipe';
import { ErrorMostrable, interpretarError } from '../../core/errores';
import { Perfil } from '../../core/modelos';
import { SubastasService } from '../../core/servicios/subastas.service';

// RF-03: perfil con las subastas publicadas y aquellas en las que participó.
@Component({
  selector: 'app-perfil',
  imports: [RouterLink, DatePipe, PesosPipe, CuentaRegresiva, EstadoSubastaInsignia, ImagenArticulo, AlertaError],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class PerfilPagina implements OnInit {

  private readonly api = inject(SubastasService);

  readonly perfil = signal<Perfil | null>(null);
  readonly error = signal<ErrorMostrable | null>(null);
  readonly pestana = signal<'participadas' | 'publicadas'>('participadas');

  readonly lista = computed(() => {
    const p = this.perfil();
    return p ? (this.pestana() === 'publicadas' ? p.publicadas : p.participadas) : [];
  });
  readonly iniciales = computed(() =>
    (this.perfil()?.usuario.nombre ?? '').split(' ').slice(0, 2).map((x) => x.charAt(0)).join('').toUpperCase()
  );

  async ngOnInit(): Promise<void> {
    try {
      this.perfil.set(await this.api.perfil());
    } catch (e) {
      this.error.set(interpretarError(e));
    }
  }
}
