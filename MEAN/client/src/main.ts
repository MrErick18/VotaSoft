import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom, Injectable } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

@Injectable({
  providedIn: 'root'
})
class ThemeService {
  private readonly themeKey = 'theme';

  getTheme(): string {
    return localStorage.getItem(this.themeKey) || 'light-theme';
  }

  setTheme(theme: string): void {
    localStorage.setItem(this.themeKey, theme);
    document.documentElement.setAttribute('data-theme', theme);
    this.updateThemeUI(theme);
  }

  toggleTheme(): void {
    const currentTheme = this.getTheme();
    const newTheme = currentTheme === 'light-theme' ? 'dark-theme' : 'light-theme';
    this.setTheme(newTheme);
  }

  private updateThemeUI(theme: string): void {
    const themeIcon = document.getElementById('theme-icon');
    const themeLabel = document.getElementById('theme-label');
    
    if (theme === 'dark-theme') {
      themeIcon?.classList.remove('fa-sun');
      themeIcon?.classList.add('fa-moon');
      if (themeLabel) themeLabel.textContent = 'Tema oscuro';
    } else {
      themeIcon?.classList.remove('fa-moon');
      themeIcon?.classList.add('fa-sun');
      if (themeLabel) themeLabel.textContent = 'Tema claro';
    }
  }
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch()),
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(ToastrModule.forRoot()),
    ThemeService
  ]
}).catch(err => console.error(err));

document.addEventListener('DOMContentLoaded', () => {
  const themeService = new ThemeService();
  const themeLink = document.getElementById('theme-link');
  const logoutLink = document.getElementById('logout-link');

  // Asegurarse de que la UI refleje el tema actual
  themeService.setTheme(themeService.getTheme());

  // Cambiar tema
  themeLink?.addEventListener('click', (event) => {
    event.preventDefault();
    themeService.toggleTheme();
  });

  // Cerrar sesión
  logoutLink?.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/login';
  });
});