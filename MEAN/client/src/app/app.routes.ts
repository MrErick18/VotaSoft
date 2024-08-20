import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MenuPrincipalComponent } from './components/menu-principal/menu-principal.component';
import { AuthGuard } from './guards/auth.guard'; // Guard para proteger rutas

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Página principal
  { path: 'login', component: LoginComponent }, // Ruta de login
  { path: 'menu-principal', component: MenuPrincipalComponent, canActivate: [AuthGuard] }, // Ruta protegida
  { path: '**', redirectTo: 'login', pathMatch: 'full' } // Redirección por defecto
];
