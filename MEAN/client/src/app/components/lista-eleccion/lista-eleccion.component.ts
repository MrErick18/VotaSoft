import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { EleccionService } from '../../services/eleccion.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-lista-eleccion',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule, NgxPaginationModule],
  templateUrl: './lista-eleccion.component.html',
  styleUrls: ['./lista-eleccion.component.css']
})
export class ListaEleccionComponent implements OnInit {
  elecciones: any[] = [];
  eleccionesFiltradas: any[] = [];
  eleccionesSeleccionadas: Set<string> = new Set();
  filtroTipo: string = '';
  terminoBusqueda: string = '';
  tiposUnicos: Set<string> = new Set();
  todosSeleccionados: boolean = false;
  estadosUnicos: Set<string> = new Set();
  filtroEstado: string = '';
  filtroFecha: string = '';
  
  // Pagination
  paginaActual: number = 1;
  itemsPorPagina: number = 10;

  constructor(
    private eleccionService: EleccionService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.obtenerElecciones();
  }

  obtenerElecciones(): void {
    this.eleccionService.getElecciones().subscribe({
      next: (data) => {
        this.elecciones = data;
        this.aplicarFiltros();
        this.actualizarTiposYEstadosUnicos();
      },
      error: (error) => {
        this.toastr.error('Error al obtener las elecciones', 'Error');
      }
    });
  }

  aplicarFiltros(): void {
    this.eleccionesFiltradas = this.elecciones.filter(eleccion => {
      const cumpleFiltroTipo = !this.filtroTipo || eleccion.tipo === this.filtroTipo;
      const cumpleFiltroEstado = !this.filtroEstado || eleccion.estado === this.filtroEstado;
      const terminoBusquedaLower = this.terminoBusqueda.toLowerCase();
      const cumpleBusqueda = !this.terminoBusqueda || 
        eleccion.nombre.toLowerCase().includes(terminoBusquedaLower) || 
        eleccion.estado.toLowerCase().includes(terminoBusquedaLower);
      const cumpleFecha = !this.filtroFecha || new Date(eleccion.fecha).toISOString().split('T')[0] === this.filtroFecha;

      return cumpleFiltroTipo && cumpleFiltroEstado && cumpleBusqueda && cumpleFecha;
    });
  }

  actualizarTiposYEstadosUnicos(): void {
    this.tiposUnicos = new Set(this.elecciones.map(e => e.tipo));
    this.estadosUnicos = new Set(this.elecciones.map(e => e.estado));
  }

  toggleSeleccion(id: string): void {
    if (this.eleccionesSeleccionadas.has(id)) {
      this.eleccionesSeleccionadas.delete(id);
    } else {
      this.eleccionesSeleccionadas.add(id);
    }
    this.actualizarTodosSeleccionados();
  }

  seleccionarTodos(): void {
    this.todosSeleccionados = !this.todosSeleccionados;
    if (this.todosSeleccionados) {
      this.eleccionesSeleccionadas = new Set(this.eleccionesFiltradas.map(e => e._id));
    } else {
      this.eleccionesSeleccionadas.clear();
    }
  }

  actualizarTodosSeleccionados(): void {
    this.todosSeleccionados = this.eleccionesSeleccionadas.size === this.eleccionesFiltradas.length;
  }

  crearEleccion(): void {
    this.router.navigate(['/gestion-eleccion']);
  }

  editarEleccion(id: string): void {
    this.router.navigate(['/gestion-eleccion', id]);
  }

  eliminarElecciones(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar ${this.eleccionesSeleccionadas.size} elección(es)?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const eliminaciones = Array.from(this.eleccionesSeleccionadas).map(id =>
          this.eleccionService.eliminarEleccion(id).toPromise()
        );

        Promise.all(eliminaciones)
          .then(() => {
            this.toastr.success('Elecciones eliminadas con éxito', 'Éxito');
            this.obtenerElecciones();
            this.eleccionesSeleccionadas.clear();
          })
          .catch(error => {
            this.toastr.error('Error al eliminar las elecciones', 'Error');
          });
      }
    });
  }

  getSelectedElectionId(): string {
    const selectedIds = Array.from(this.eleccionesSeleccionadas);
    return selectedIds[0] || '';
  }

  hasOneElectionSelected(): boolean {
    return this.eleccionesSeleccionadas.size === 1;
  }
}