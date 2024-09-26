import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CandidatoService {
  private apiUrl = `${environment.apiUrl}/candidato`;

  constructor(private http: HttpClient) {}

  getCandidatos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  crearCandidato(candidato: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, candidato);
  }

  actualizarCandidato(id: string, candidato: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, candidato);
  }

  eliminarCandidato(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCandidato(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}