import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Bootstrap the Angular application
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),  // Global provider for HttpClient
    provideRouter(routes)
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
