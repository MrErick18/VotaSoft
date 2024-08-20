import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Administrador } from '../models/administrador';

@Injectable({
  providedIn: 'root'
})
export class AdministradorService {
  private url = 'http://localhost:4000/api/administradores/'; // URL base de la API

  constructor(private http: HttpClient) { }

  obtenerAdministradores(): Observable<any> {
    return this.http.get(this.url);
  }

  obtenerAdministrador(id: string): Observable<any> {
    return this.http.get(`${this.url}${id}`);
  }

  agregarAdministrador(administrador: Administrador): Observable<any> {
    return this.http.post(this.url, administrador);
  }

  actualizarAdministrador(id: string, administrador: Administrador): Observable<any> {
    return this.http.put(`${this.url}${id}`, administrador);
  }

  eliminarAdministrador(id: string): Observable<any> {
    return this.http.delete(`${this.url}${id}`);
  }
}
