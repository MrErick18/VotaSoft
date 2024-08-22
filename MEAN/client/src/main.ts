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
  const logoutLink = document.getElementById('logout-link');
  
  if (logoutLink) {
    logoutLink.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = '/login'; // Redirect to the login page after logout
    });
  }
});
