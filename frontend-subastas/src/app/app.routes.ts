import { Routes } from '@angular/router';
import { requiereSesion, soloVisitantes } from './core/guardas/sesion.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'subastas' },
  {
    path: 'login',
    canActivate: [soloVisitantes],
    title: 'Ingresar · Subastas en Línea',
    loadComponent: () => import('./paginas/acceso/acceso').then((m) => m.Acceso),
    data: { modo: 'login' }
  },
  {
    path: 'registro',
    canActivate: [soloVisitantes],
    title: 'Crear cuenta · Subastas en Línea',
    loadComponent: () => import('./paginas/acceso/acceso').then((m) => m.Acceso),
    data: { modo: 'registro' }
  },
  {
    path: 'subastas',
    canActivate: [requiereSesion],
    title: 'Subastas · Subastas en Línea',
    loadComponent: () => import('./paginas/listado/listado').then((m) => m.Listado)
  },
  {
    path: 'subastas/publicar',
    canActivate: [requiereSesion],
    title: 'Publicar · Subastas en Línea',
    loadComponent: () => import('./paginas/publicar/publicar').then((m) => m.Publicar)
  },
  {
    path: 'subastas/:id',
    canActivate: [requiereSesion],
    title: 'Detalle · Subastas en Línea',
    loadComponent: () => import('./paginas/detalle/detalle').then((m) => m.Detalle)
  },
  {
    path: 'perfil',
    canActivate: [requiereSesion],
    title: 'Mi actividad · Subastas en Línea',
    loadComponent: () => import('./paginas/perfil/perfil').then((m) => m.PerfilPagina)
  },
  {
    path: 'ordenes',
    canActivate: [requiereSesion],
    title: 'Mis pagos · Subastas en Línea',
    loadComponent: () => import('./paginas/ordenes/ordenes').then((m) => m.Ordenes)
  },
  { path: '**', redirectTo: 'subastas' }
];
