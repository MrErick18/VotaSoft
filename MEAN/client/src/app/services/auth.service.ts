import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:4000/api/administrador'; // Asegúrate de que esta URL coincide con tu backend

  constructor(private http: HttpClient) { }

  login(numDoc: string, contrasena: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { numDoc: numDoc, contrasena: contrasena });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }
}
