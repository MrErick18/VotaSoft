import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VotoService {
  private apiUrl = `${environment.apiUrl}/voto`;

  constructor(private http: HttpClient) {}

  emitirVoto(voto: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, voto);
  }

  getVotosPorEleccion(eleccionId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/eleccion/${eleccionId}`);
  }
}