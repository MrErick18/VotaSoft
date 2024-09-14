import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FilterPipe } from './filter.pipe'; // Ajusta la ruta según sea necesario
import { UsuariosService } from '../../services/usuarios.service'; // Asegúrate de que la ruta sea correcta
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination'; // Importa NgxPaginationModule

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    FilterPipe,
    NgxPaginationModule // Añade NgxPaginationModule
  ],
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.css']
})
export class GestionUsuariosComponent implements OnInit {
  usuarios: any[] = [];
  selectedFile: File | null = null;
  searchText: string = '';
  p: number = 1; // Página actual

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

  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    this.usuarios.forEach(usuario => usuario.selected = checked);
  }

  anySelected(): boolean {
    return this.usuarios.some(usuario => usuario.selected);
  }

  eliminarUsuariosSeleccionados(): void {
    const usuariosSeleccionados = this.usuarios.filter(usuario => usuario.selected);

    if (usuariosSeleccionados.length === 0) {
      this.toastr.warning('No se ha seleccionado ningún usuario.', 'Advertencia');
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const idsSeleccionados = usuariosSeleccionados.map(usuario => usuario._id);

        this.usuariosService.eliminarUsuarios(idsSeleccionados).subscribe(
          response => {
            Swal.fire('Eliminado!', 'Los usuarios seleccionados han sido eliminados.', 'success');
            this.obtenerUsuarios(); // Actualiza la lista de usuarios después de la eliminación
          },
          error => {
            Swal.fire('Error!', 'No se pudieron eliminar los usuarios.', 'error');
            console.error('Error al eliminar los usuarios:', error);
          }
        );
      }
    });
  }
}
