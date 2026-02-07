import { Routes } from '@angular/router';
import { LoginComponent } from './modulos/login/login';
import { AdminUsuariosComponent } from './modulos/admin-usuario/admin-usuarios';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin/usuarios', component: AdminUsuariosComponent },
];
