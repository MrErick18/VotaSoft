import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/administrador`; // URL base de la API

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
