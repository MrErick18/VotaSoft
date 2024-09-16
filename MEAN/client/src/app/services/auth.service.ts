import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router'; // Importa Router para redirección

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/administrador`; // URL base de la API

  constructor(private http: HttpClient, private router: Router) { } // Inyecta Router

  login(numDoc: string, contrasena: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { numDoc: numDoc, contrasena: contrasena });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']); // Redirige al login después del logout
  }
}
