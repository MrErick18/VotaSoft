import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EleccionService {
  private apiUrl = 'http://localhost:4000/api/eleccion';

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
