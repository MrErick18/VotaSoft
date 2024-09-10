import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FilterPipe } from './filter.pipe'; // Ajusta la ruta según sea necesario
import { UsuariosService } from '../../services/usuarios.service'; // Asegúrate de que la ruta sea correcta
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    FilterPipe
  ],
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.css']
})
export class GestionUsuariosComponent implements OnInit {
  usuarios: any[] = [];
  selectedFile: File | null = null;
  searchText: string = '';

  constructor(
    private usuariosService: UsuariosService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  obtenerUsuarios(): void {
    this.usuariosService.obtenerUsuarios().subscribe(
      (data) => {
        this.usuarios = data;
      },
      (error) => {
        console.error('Error al obtener los usuarios:', error);
      }
    );
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    const allowedExtensions = /(\.xlsx)$/i;
    if (file && allowedExtensions.exec(file.name)) {
      this.selectedFile = file;
    } else {
      this.selectedFile = null;
      this.toastr.error('Solo se permiten archivos con extensión .xlsx', 'Error de archivo');
    }
  }

  uploadFile(): void {
    if (this.selectedFile) {
      this.toastr.info('Subiendo archivo...', 'En progreso');
      this.usuariosService.subirArchivo(this.selectedFile).subscribe(
        (response: any) => {
          this.toastr.success(response.message, 'Éxito'); // Usa el mensaje de la respuesta del servidor
          console.log('Archivo subido correctamente:', response);
          this.obtenerUsuarios(); // Actualizar la lista de usuarios después de subir el archivo
        },
        (error) => {
          this.toastr.error(error.error.error, 'Error'); // Usa el mensaje de error de la respuesta del servidor
          console.error('Error al subir el archivo:', error);
        }
      );
    } else {
      this.toastr.warning('Por favor selecciona un archivo primero', 'Archivo no seleccionado');
    }
  }

  eliminarUsuario(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.usuariosService.eliminarUsuario(id).subscribe(
        () => {
          this.toastr.success('Usuario eliminado con éxito', 'Éxito');
          this.obtenerUsuarios(); // Actualizar la lista de usuarios después de eliminar
        },
        (error) => {
          this.toastr.error('Error al eliminar el usuario', 'Error');
        }
      );
    }
  }
}

