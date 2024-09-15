import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CandidatoService {
  private apiUrl = `${environment.apiUrl}/candidato`; // URL de tu API

  constructor(private http: HttpClient) {}

  // Obtener la lista de candidatos
  getCandidatos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Crear un nuevo candidato
  crearCandidato(candidato: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, candidato);
  }

  // Actualizar un candidato existente
  actualizarCandidato(id: string, candidato: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, candidato);
  }

  // Eliminar un candidato
  eliminarCandidato(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Obtener un candidato específico por ID
  getCandidato(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
