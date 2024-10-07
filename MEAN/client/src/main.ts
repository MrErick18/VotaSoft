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
    provideHttpClient(withFetch()),
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(ToastrModule.forRoot())
  ]
}).catch(err => console.error(err));

document.addEventListener('DOMContentLoaded', () => {
  const themeLink = document.getElementById('theme-link') as HTMLElement;
  const themeIcon = document.getElementById('theme-icon') as HTMLElement;
  const themeLabel = document.getElementById('theme-label') as HTMLSpanElement;
  const logoutLink = document.getElementById('logout-link');

  // Inicializar el tema
  const currentTheme = localStorage.getItem('theme') || 'light-theme';
  document.body.classList.add(currentTheme);
  updateThemeUI(currentTheme);

  // Cambiar tema
  themeLink.addEventListener('click', (event) => {
    event.preventDefault();
    const newTheme = document.body.classList.contains('dark-theme') ? 'light-theme' : 'dark-theme';
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeUI(newTheme);
  });

  // Cerrar sesión
  logoutLink?.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/login';
  });

  function updateThemeUI(theme: string) {
    if (theme === 'dark-theme') {
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
      themeLabel.textContent = 'Tema oscuro';
    } else {
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
      themeLabel.textContent = 'Tema claro';
    }
  }
});