import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RespuestaApi, Sesion, Usuario } from '../modelos';

const CLAVE = 'subastas.sesion';

// RF-21: inicio de sesión y conservación de la sesión entre recargas.
@Injectable({ providedIn: 'root' })
export class SesionService {

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly sesion = signal<Sesion | null>(this.leerGuardada());

  readonly usuario = computed<Usuario | null>(() => this.sesion()?.usuario ?? null);
  readonly autenticado = computed(() => this.sesion() !== null);

  token(): string | null {
    return this.sesion()?.token ?? null;
  }

  async iniciarSesion(correo: string, password: string): Promise<void> {
    const sesion = await firstValueFrom(
      this.http
        .post<RespuestaApi<Sesion>>(`${environment.apiUrl}/auth/login`, { correo, password })
        .pipe(map((r) => r.data))
    );
    this.guardar(sesion);
  }

  async registrar(nombre: string, correo: string, password: string): Promise<void> {
    await firstValueFrom(
      this.http.post<RespuestaApi<Usuario>>(`${environment.apiUrl}/auth/register`, { nombre, correo, password })
    );
    await this.iniciarSesion(correo, password);
  }

  cerrarSesion(redirigir = true): void {
    this.sesion.set(null);
    try {
      localStorage.removeItem(CLAVE);
    } catch {
      // almacenamiento no disponible
    }
    if (redirigir) {
      void this.router.navigate(['/login']);
    }
  }

  private guardar(sesion: Sesion): void {
    this.sesion.set(sesion);
    try {
      localStorage.setItem(CLAVE, JSON.stringify(sesion));
    } catch {
      // almacenamiento no disponible
    }
  }

  // Recupera la sesión guardada y la descarta si el token ya expiró.
  private leerGuardada(): Sesion | null {
    try {
      const texto = localStorage.getItem(CLAVE);
      if (!texto) {
        return null;
      }
      const sesion = JSON.parse(texto) as Sesion;
      const payload = JSON.parse(atob(sesion.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
      if (!payload.exp || payload.exp * 1000 <= Date.now()) {
        localStorage.removeItem(CLAVE);
        return null;
      }
      return sesion;
    } catch {
      return null;
    }
  }
}
