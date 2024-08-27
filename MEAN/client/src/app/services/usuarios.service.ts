import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'http://localhost:4000/api/usuarios'; // Ajusta la URL según sea necesario

  constructor(private http: HttpClient) {}

  validarUsuario(tipoDoc: string, numDoc: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/validar?tipoDoc=${tipoDoc}&numDoc=${numDoc}`);
  }
}
