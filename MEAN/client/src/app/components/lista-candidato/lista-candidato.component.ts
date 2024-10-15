import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CandidatoService } from '../../services/candidato.service';
import { EleccionService } from '../../services/eleccion.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-lista-candidato',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule],
  templateUrl: './lista-candidato.component.html',
  styleUrls: ['./lista-candidato.component.css']
})
export class ListaCandidatoComponent implements OnInit, OnDestroy {
  candidatos: any[] = [];
  elecciones: any[] = [];
  eleccionSeleccionada: string = '';
  todosLosCandidatos: any[] = [];
  searchTerm: string = '';
  candidatosSeleccionados: any[] = [];
  todosSeleccionados: boolean = false;

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private candidatoService: CandidatoService,
    private eleccionService: EleccionService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.inicializarDatos();
    this.configurarBusqueda();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private inicializarDatos(): void {
    forkJoin({
      elecciones: this.eleccionService.getElecciones(),
      candidatos: this.candidatoService.getCandidatos()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ elecciones, candidatos }) => {
        this.elecciones = elecciones;
        this.todosLosCandidatos = candidatos;
        this.filtrarCandidatos();
      },
      error: (error) => {
        this.toastr.error('Error al cargar los datos', 'Error');
        console.error('Error al cargar los datos:', error);
      }
    });
  }

  private configurarBusqueda(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.filtrarCandidatos();
    });
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  onEleccionChange(): void {
    this.filtrarCandidatos();
  }

  filtrarCandidatos(): void {
    this.candidatos = this.todosLosCandidatos.filter(candidato => {
      const cumpleEleccion = !this.eleccionSeleccionada || 
        (candidato.eleccion && candidato.eleccion._id === this.eleccionSeleccionada);
      const cumpleBusqueda = !this.searchTerm || 
        (candidato.nombreCompleto && candidato.nombreCompleto.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (candidato.perfil && candidato.perfil.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (candidato.propuestas && candidato.propuestas.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (candidato.eleccion && candidato.eleccion.nombre && candidato.eleccion.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      return cumpleEleccion && cumpleBusqueda;
    });
    this.actualizarSeleccionTodos();
  }

  crearCandidato(): void {
    this.router.navigate(['/gestion-candidato']);
  }

  editarSeleccionado(): void {
    if (this.candidatosSeleccionados.length === 1) {
      this.router.navigate(['/gestion-candidato', this.candidatosSeleccionados[0]._id]);
    }
  }

  eliminarSeleccionados(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminarán ${this.candidatosSeleccionados.length} candidato(s)`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const eliminarObservables = this.candidatosSeleccionados.map(candidato =>
          this.candidatoService.eliminarCandidato(candidato._id)
        );

        forkJoin(eliminarObservables).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: () => {
            this.toastr.success('Candidatos eliminados con éxito', 'Éxito');
            this.inicializarDatos();
            this.candidatosSeleccionados = [];
          },
          error: (error) => {
            this.toastr.error('Error al eliminar los candidatos', 'Error');
          }
        });
      }
    });
  }

  toggleSeleccion(candidato: any): void {
    const index = this.candidatosSeleccionados.findIndex(c => c._id === candidato._id);
    if (index > -1) {
      this.candidatosSeleccionados.splice(index, 1);
    } else {
      this.candidatosSeleccionados.push(candidato);
    }
    this.actualizarSeleccionTodos();
  }

  estaSeleccionado(candidato: any): boolean {
    return this.candidatosSeleccionados.some(c => c._id === candidato._id);
  }

  seleccionarTodos(event: any): void {
    this.candidatosSeleccionados = event.target.checked ? [...this.candidatos] : [];
    this.actualizarSeleccionTodos();
  }

  actualizarSeleccionTodos(): void {
    this.todosSeleccionados = this.candidatos.length > 0 && this.candidatosSeleccionados.length === this.candidatos.length;
  }
}