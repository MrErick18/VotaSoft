import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'http://localhost:4000/api/usuarios'; // URL base correcta

  constructor(private http: HttpClient) {}

  eliminarUsuario(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`); // La URL debe ser correcta
  }

  eliminarUsuarios(ids: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/eliminar`, { ids });
  }
  
  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }
  
  subirArchivo(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<any>(`${this.apiUrl}/subirArchivo`, formData);
  }
  
  validarUsuario(tipoDoc: string, numDoc: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/validar`, { tipoDoc, numDoc });
  }
}
