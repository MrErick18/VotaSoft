import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResultadosService {
  private apiUrl = `${environment.apiUrl}/resultados`;

  constructor(private http: HttpClient) { }

  generarPDF(eleccionId: string, datosCompletos: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/pdf/${eleccionId}`, 
      datosCompletos, 
      { responseType: 'blob' }
    );
  }
}