import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AvisosService } from '../servicios/avisos.service';
import { SesionService } from '../servicios/sesion.service';

// Agrega el token a cada petición hacia la API y cierra la sesión si expiró.
export const autenticacionInterceptor: HttpInterceptorFn = (peticion, siguiente) => {

  const sesion = inject(SesionService);
  const avisos = inject(AvisosService);
  const token = sesion.token();

  const conToken =
    token && peticion.url.startsWith(environment.apiUrl)
      ? peticion.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : peticion;

  return siguiente(conToken).pipe(
    catchError((error: unknown) => {
      const esLogin = peticion.url.endsWith('/auth/login');
      if (error instanceof HttpErrorResponse && error.status === 401 && token && !esLogin) {
        avisos.mostrar('Tu sesión expiró. Inicia sesión de nuevo.', 'alerta');
        sesion.cerrarSesion();
      }
      return throwError(() => error);
    })
  );
};
