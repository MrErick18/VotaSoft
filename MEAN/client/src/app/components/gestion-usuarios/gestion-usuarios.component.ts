import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FilterPipe } from './filter.pipe';
import { UsuariosService } from '../../services/usuarios.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    FilterPipe,
    NgxPaginationModule
  ],
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.css']
})
export class GestionUsuariosComponent implements OnInit {
  usuarios: any[] = [];
  selectedFile: File | null = null;
  searchText: string = '';
  p: number = 1;

  constructor(
    private usuariosService: UsuariosService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  obtenerUsuarios(): void {
    this.usuariosService.obtenerUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data.map(usuario => ({ ...usuario, selected: false }));
      },
      error: (error) => {
        console.error('Error al obtener los usuarios:', error);
        this.toastr.error('No se pudieron cargar los usuarios', 'Error');
      }
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    const allowedExtensions = /(\.xlsx)$/i;
    if (file && allowedExtensions.exec(file.name)) {
      this.selectedFile = file;
      this.toastr.success('Archivo seleccionado correctamente', 'Éxito');
    } else {
      this.selectedFile = null;
      this.toastr.error('Solo se permiten archivos con extensión .xlsx', 'Error de archivo');
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.toastr.warning('Por favor selecciona un archivo primero', 'Archivo no seleccionado');
      return;
    }

    Swal.fire({
      title: 'Subiendo archivo',
      text: 'Por favor espere...',
      icon: 'info',
      allowOutsideClick: false,
      showConfirmButton: false
    });

    this.usuariosService.subirArchivo(this.selectedFile).subscribe({
      next: (response: any) => {
        Swal.close();
        this.toastr.success(response.message, 'Éxito');
        this.obtenerUsuarios();
      },
      error: (error) => {
        Swal.close();
        this.toastr.error(error.error.error || 'Ocurrió un error al subir el archivo', 'Error');
        console.error('Error al subir el archivo:', error);
      }
    });
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
      text: `Se eliminarán ${usuariosSeleccionados.length} usuario(s)`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4CAF50',
      cancelButtonColor: '#f44336',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const idsSeleccionados = usuariosSeleccionados.map(usuario => usuario._id);

        Swal.fire({
          title: 'Eliminando usuarios',
          text: 'Por favor espere...',
          icon: 'info',
          allowOutsideClick: false,
          showConfirmButton: false
        });

        this.usuariosService.eliminarUsuarios(idsSeleccionados).subscribe({
          next: response => {
            Swal.close();
            Swal.fire('Eliminado!', 'Los usuarios seleccionados han sido eliminados.', 'success');
            this.obtenerUsuarios();
          },
          error: error => {
            Swal.close();
            Swal.fire('Error!', 'No se pudieron eliminar los usuarios.', 'error');
            console.error('Error al eliminar los usuarios:', error);
          }
        });
      }
    });
  }
}