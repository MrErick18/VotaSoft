import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = `${environment.apiUrl}/usuarios`; // URL base correcta

  constructor(private http: HttpClient) {}

  eliminarUsuario(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
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

  // Nuevo método para generar el código de verificación
  generarCodigoVerificacion(tipoDoc: string, numDoc: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/generar-codigo`, { tipoDoc, numDoc });
  }

  // Nuevo método para verificar el código
  verificarCodigo(tipoDoc: string, numDoc: string, codigo: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verificar-codigo`, { tipoDoc, numDoc, codigo });
  }
}