import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { ProfileComponent } from './features/auth/profile/profile';
import { ListadoSubastasComponent } from './features/subastas/listado-subastas/listado-subastas';
import { CrearSubastaComponent } from './features/subastas/crear-subasta/crear-subasta';
import { DetalleSubastaComponent} from './features/subastas/detalle-subasta/detalle-subasta';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'register',
    component: RegisterComponent
  },

  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'subastas',
    component: ListadoSubastasComponent
    },
    {
  path: 'subastas/nueva',
  component: CrearSubastaComponent
    },
    {
  path: 'subastas/:id',
  component: DetalleSubastaComponent
},

];