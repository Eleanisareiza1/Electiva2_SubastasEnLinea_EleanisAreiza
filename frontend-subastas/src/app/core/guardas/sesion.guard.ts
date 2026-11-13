import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionService } from '../servicios/sesion.service';

// Solo usuarios autenticados.
export const requiereSesion: CanActivateFn = (_ruta, estado) => {
  const sesion = inject(SesionService);
  return sesion.autenticado()
    ? true
    : inject(Router).createUrlTree(['/login'], { queryParams: { volver: estado.url } });
};

// Solo visitantes (login y registro).
export const soloVisitantes: CanActivateFn = () => {
  const sesion = inject(SesionService);
  return sesion.autenticado() ? inject(Router).createUrlTree(['/subastas']) : true;
};
