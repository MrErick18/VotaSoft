import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CandidatoService } from '../../services/candidato.service';
import { EleccionService } from '../../services/eleccion.service';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-lista-candidato',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule],
  templateUrl: './lista-candidato.component.html',
  styleUrls: ['./lista-candidato.component.css']
})
export class ListaCandidatoComponent implements OnInit {
  candidatos: any[] = [];
  elecciones: any[] = [];
  eleccionSeleccionada: string = '';
  todosLosCandidatos: any[] = [];

  constructor(
    private candidatoService: CandidatoService,
    private eleccionService: EleccionService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.obtenerElecciones();
    this.obtenerCandidatos();
  }

  obtenerElecciones(): void {
    this.eleccionService.getElecciones().subscribe(
      data => {
        this.elecciones = data;
      },
      error => {
        this.toastr.error('Error al obtener las elecciones', 'Error');
      }
    );
  }

  obtenerCandidatos(): void {
    this.candidatoService.getCandidatos().subscribe(
      data => {
        this.todosLosCandidatos = data;
        this.candidatos = data;
      },
      error => {
        this.toastr.error('Error al obtener los candidatos', 'Error');
      }
    );
  }

  filtrarCandidatos(): void {
    if (this.eleccionSeleccionada) {
      this.candidatos = this.todosLosCandidatos.filter(
        candidato => candidato.eleccion._id === this.eleccionSeleccionada
      );
    } else {
      this.candidatos = this.todosLosCandidatos;
    }
  }

  crearCandidato(): void {
    this.router.navigate(['/gestion-candidato']);
  }

  editarCandidato(id: string): void {
    this.router.navigate(['/gestion-candidato', id]);
  }  

  eliminarCandidato(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este candidato?')) {
      this.candidatoService.eliminarCandidato(id).subscribe(
        () => {
          this.toastr.success('Candidato eliminado con éxito', 'Éxito');
          this.obtenerCandidatos();
        },
        error => {
          this.toastr.error('Error al eliminar el candidato', 'Error');
        }
      );
    }
  }
}
