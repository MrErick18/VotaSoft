import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/administrador`;

  constructor(private http: HttpClient, private router: Router) { }

  login(numDoc: string, contrasena: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { numDoc, contrasena });
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getAdministradorLogueado(): Observable<any> {
    const token = this.getToken();
    console.log('Token obtenido:', token);
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Payload decodificado:', payload);
        // Intentamos obtener el nombre completo de diferentes maneras
        const nombreCompleto = payload.nombreCompleto ||
          (payload.nombre && payload.apellido ? `${payload.nombre} ${payload.apellido}` : null) ||
          'Administrador';
        return of({
          nombreCompleto: nombreCompleto,
          numDoc: payload.numDoc
        });
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        return of({ nombreCompleto: 'Administrador', numDoc: '' });
      }
    }
    return of({ nombreCompleto: 'Administrador', numDoc: '' });
  }

  obtenerDetallesAdministrador(numDoc: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/detalles/${numDoc}`);
  }
}
