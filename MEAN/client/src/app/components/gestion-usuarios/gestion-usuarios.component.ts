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
        this.usuarios = data.map(usuario => ({ ...usuario, selected: false }));
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
          this.toastr.success(response.message, 'Éxito');
          console.log('Archivo subido correctamente:', response);
          this.obtenerUsuarios();
        },
        (error) => {
          this.toastr.error(error.error.error, 'Error');
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
          this.obtenerUsuarios();
        },
        (error) => {
          this.toastr.error('Error al eliminar el usuario', 'Error');
        }
      );
    }
  }

  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    this.usuarios.forEach(usuario => usuario.selected = checked);
  }

  anySelected(): boolean {
    return this.usuarios.some(usuario => usuario.selected);
  }

  eliminarUsuariosSeleccionados(): void {
    const usuariosSeleccionados = this.usuarios.filter(usuario => usuario.selected).map(usuario => usuario._id);
    if (usuariosSeleccionados.length > 0 && confirm('¿Estás seguro de que deseas eliminar los usuarios seleccionados?')) {
      usuariosSeleccionados.forEach(id => {
        this.usuariosService.eliminarUsuario(id).subscribe(
          () => {
            this.toastr.success('Usuario eliminado con éxito', 'Éxito');
            this.obtenerUsuarios();
          },
          (error) => {
            this.toastr.error('Error al eliminar el usuario', 'Error');
          }
        );
      });
    }
  }
}
