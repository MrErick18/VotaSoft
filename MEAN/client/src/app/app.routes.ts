import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MenuPrincipalComponent } from './components/menu-principal/menu-principal.component';
import { AuthGuard } from './guards/auth.guard'; // Guard para proteger rutas
import { AyudaSoporteComponent } from './components/ayuda-soporte/ayuda-soporte.component';
import { AcercaDeComponent } from './components/acerca-de/acerca-de.component';
import { GestionCandidatosComponent } from './components/gestion-candidatos/gestion-candidatos.component';
import { GestionEleccionComponent } from './components/gestion-eleccion/gestion-eleccion.component';
import { GestionUsuariosComponent } from './components/gestion-usuarios/gestion-usuarios.component';
import { GestionResultadosComponent } from './components/gestion-resultados/gestion-resultados.component';
import { MenuVotoComponent } from './components/menu-voto/menu-voto.component';
import { RegistroAdministradorComponent } from './components/registro-administrador/registro-administrador.component';
import { IngresoVotoComponent } from './components/ingreso-voto/ingreso-voto.component';
import { OlvideContrasenaComponent } from './components/olvide-contrasena/olvide-contrasena.component';
import { ListaCandidatoComponent } from './components/lista-candidato/lista-candidato.component';
import { ListaEleccionComponent } from './components/lista-eleccion/lista-eleccion.component';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Página principal
  { path: 'login', component: LoginComponent }, // Ruta de login
  { path: 'olvide-contrasena', component: OlvideContrasenaComponent},
  { path: 'registro-administrador', component: RegistroAdministradorComponent},
  { path: 'menu-principal', component: MenuPrincipalComponent, canActivate: [AuthGuard] },
  { path: 'lista-candidato', component: ListaCandidatoComponent, canActivate: [AuthGuard]},
  { path: 'lista-eleccion', component: ListaEleccionComponent, canActivate: [AuthGuard]},
  { path: 'gestion-candidato', component: GestionCandidatosComponent, canActivate: [AuthGuard]},
  { path: 'gestion-candidato/:id', component: GestionCandidatosComponent, canActivate: [AuthGuard]},
  { path: 'gestion-eleccion', component: GestionEleccionComponent, canActivate: [AuthGuard]},
  { path: 'gestion-eleccion/:id', component: GestionEleccionComponent, canActivate: [AuthGuard]},
  { path: 'gestion-usuarios', component: GestionUsuariosComponent, canActivate: [AuthGuard]},
  { path: 'gestion-resultados', component: GestionResultadosComponent, canActivate:[AuthGuard]},
  { path: 'menu-voto', component: MenuVotoComponent, canActivate: [AuthGuard]},
  { path: 'ingreso-voto/:eleccionId', component: IngresoVotoComponent, canActivate: [AuthGuard]},
  { path: 'acerca-de', component: AcercaDeComponent },
  { path: 'ayuda-soporte', component: AyudaSoporteComponent},
  { path: '**', redirectTo: 'login', pathMatch: 'full' } // Redirección por defecto
];
