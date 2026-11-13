import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AlertaError } from '../../compartido/alerta-error';
import { ErrorMostrable, interpretarError } from '../../core/errores';
import { SesionService } from '../../core/servicios/sesion.service';

// Pantalla de ingreso y registro (RF-01, RF-02, RF-21).
@Component({
  selector: 'app-acceso',
  imports: [FormsModule, RouterLink, AlertaError],
  templateUrl: './acceso.html',
  styleUrl: './acceso.css'
})
export class Acceso {

  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  readonly modo = toSignal(this.ruta.data.pipe(map((d) => (d['modo'] as 'login' | 'registro') ?? 'login')), {
    initialValue: 'login' as const
  });
  readonly esRegistro = computed(() => this.modo() === 'registro');
  readonly mostrarDemo = environment.mostrarUsuariosDemo;

  nombre = '';
  correo = '';
  password = '';
  readonly enviando = signal(false);
  readonly error = signal<ErrorMostrable | null>(null);

  usarDemo(correo: string): void {
    this.correo = correo;
    this.password = 'Demo12345';
  }

  async enviar(): Promise<void> {
    this.error.set(null);

    if (this.esRegistro() && this.password.length < 8) {
      this.error.set({ codigo: 'PASSWORD_DEBIL', mensaje: 'La contraseña debe tener al menos 8 caracteres.', detalles: [] });
      return;
    }

    this.enviando.set(true);
    try {
      if (this.esRegistro()) {
        await this.sesion.registrar(this.nombre, this.correo, this.password);
      } else {
        await this.sesion.iniciarSesion(this.correo, this.password);
      }
      const volver = this.ruta.snapshot.queryParamMap.get('volver');
      await this.router.navigateByUrl(volver && volver.startsWith('/') ? volver : '/subastas');
    } catch (e) {
      this.error.set(interpretarError(e));
    } finally {
      this.enviando.set(false);
    }
  }
}
