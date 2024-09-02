import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidatoService } from '../../services/candidato.service';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-lista-candidato',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './lista-candidato.component.html',
  styleUrls: ['./lista-candidato.component.css']
})
export class ListaCandidatoComponent implements OnInit {
  candidatos: any[] = [];

  constructor(private candidatoService: CandidatoService, private router: Router) {}

  ngOnInit(): void {
    this.obtenerCandidatos();
  }

  obtenerCandidatos(): void {
    this.candidatoService.getCandidatos().subscribe(
      data => {
        this.candidatos = data;
      },
      error => {
        console.error('Error al obtener los candidatos:', error);
      }
    );
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
          this.obtenerCandidatos();
        },
        error => {
          console.error('Error al eliminar el candidato:', error);
        }
      );
    }
  }
}
