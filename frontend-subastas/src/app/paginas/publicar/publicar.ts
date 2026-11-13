import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AlertaError } from '../../compartido/alerta-error';
import { ImagenArticulo } from '../../compartido/imagen-articulo';
import { PesosPipe } from '../../compartido/pesos.pipe';
import { ErrorMostrable, interpretarError } from '../../core/errores';
import { Categoria, ESTADOS_CONSERVACION } from '../../core/modelos';
import { AvisosService } from '../../core/servicios/avisos.service';
import { SubastasService } from '../../core/servicios/subastas.service';

const HORA = 60 * 60 * 1000;

function aEntradaLocal(fecha: Date): string {
  const desfase = fecha.getTimezoneOffset() * 60000;
  return new Date(fecha.getTime() - desfase).toISOString().slice(0, 16);
}

// RF-04 y RF-23: formulario de publicación. La API valida el formato y el
// dominio decide RN-01, RN-02 y RN-03; aquí solo se ayuda al usuario.
@Component({
  selector: 'app-publicar',
  imports: [FormsModule, RouterLink, AlertaError, ImagenArticulo, PesosPipe],
  templateUrl: './publicar.html',
  styleUrl: './publicar.css'
})
export class Publicar implements OnInit {

  private readonly api = inject(SubastasService);
  private readonly router = inject(Router);
  private readonly avisos = inject(AvisosService);

  readonly categorias = signal<Categoria[]>([]);
  readonly conservaciones = ESTADOS_CONSERVACION;
  readonly enviando = signal(false);
  readonly error = signal<ErrorMostrable | null>(null);

  readonly nombre = signal('');
  readonly descripcion = signal('');
  readonly categoriaId = signal('');
  readonly estadoConservacion = signal('BUEN_ESTADO');
  readonly imagenUrl = signal('');
  readonly precioBase = signal<number | null>(null);
  readonly incrementoMinimo = signal<number | null>(null);
  readonly fechaCierre = signal(aEntradaLocal(new Date(Date.now() + 3 * 24 * HORA)));

  readonly minimoFecha = aEntradaLocal(new Date(Date.now() + HORA + 60000));
  readonly maximoFecha = aEntradaLocal(new Date(Date.now() + 30 * 24 * HORA));

  readonly categoriaNombre = computed(() => this.categorias().find((c) => c.id === this.categoriaId())?.nombre ?? '');
  readonly duracion = computed(() => {
    const ms = new Date(this.fechaCierre()).getTime() - Date.now();
    if (isNaN(ms) || ms <= 0) {
      return 'La fecha debe estar en el futuro';
    }
    const horas = Math.floor(ms / HORA);
    return horas >= 24 ? `Durará ${Math.floor(horas / 24)} días y ${horas % 24} h` : `Durará ${horas} h ${Math.floor((ms % HORA) / 60000)} min`;
  });

  async ngOnInit(): Promise<void> {
    try {
      const categorias = await this.api.categorias();
      this.categorias.set(categorias);
      if (!this.categoriaId() && categorias.length) {
        this.categoriaId.set(categorias[0].id);
      }
    } catch (e) {
      this.error.set(interpretarError(e));
    }
  }

  async publicar(): Promise<void> {
    this.error.set(null);
    this.enviando.set(true);
    try {
      const subasta = await this.api.publicar({
        nombre: this.nombre(),
        descripcion: this.descripcion(),
        categoriaId: this.categoriaId(),
        estadoConservacion: this.estadoConservacion(),
        imagenUrl: this.imagenUrl().trim() || null,
        precioBase: Number(this.precioBase()),
        incrementoMinimo: Number(this.incrementoMinimo()),
        fechaCierre: new Date(this.fechaCierre()).toISOString()
      });
      this.avisos.mostrar('¡Tu subasta está publicada y en vivo!', 'exito');
      await this.router.navigate(['/subastas', subasta.id]);
    } catch (e) {
      this.error.set(interpretarError(e));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      this.enviando.set(false);
    }
  }
}
