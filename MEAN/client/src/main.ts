import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch()),  // Aquí se habilita 'fetch'
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(ToastrModule.forRoot())
  ]
}).catch(err => console.error(err));

// Add logout functionality after the application is initialized
document.addEventListener('DOMContentLoaded', () => {
  const enlaceCierreSesion = document.getElementById('logout-link');
  
  if (enlaceCierreSesion) {
    enlaceCierreSesion.addEventListener('click', (evento) => {
      evento.preventDefault(); // Previene el comportamiento predeterminado del enlace
      localStorage.removeItem('token');
      window.location.href = '/login'; // Redirige a la página de inicio de sesión después de cerrar sesión
    });
  }
});
