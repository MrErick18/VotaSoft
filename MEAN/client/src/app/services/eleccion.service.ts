import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EleccionService {
  private apiUrl = `${environment.apiUrl}/eleccion`;

  constructor(private http: HttpClient) { }

  getElecciones(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  crearEleccion(eleccion: any): Observable<any> {
    return this.http.post(this.apiUrl, eleccion);
  }

  actualizarEleccion(id: string, eleccion: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, eleccion);
  }

  eliminarEleccion(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getEleccion(id: string): Observable<any> { // Cambio aquí
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
