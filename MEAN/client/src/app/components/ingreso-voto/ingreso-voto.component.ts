import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CandidatoService } from '../../services/candidato.service';
import { VotoService } from '../../services/voto.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ingreso-voto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ingreso-voto.component.html',
  styleUrl: './ingreso-voto.component.css'
})
export class IngresoVotoComponent implements OnInit {
  candidatos: any[] = [];
  candidatoSeleccionadoId: string = '';
  eleccionId: string = '';
  usuarioId: string = '';

  constructor(
    private candidatoService: CandidatoService,
    private votoService: VotoService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.eleccionId = params['eleccionId'];
      this.usuarioId = params['usuarioId'];
      this.cargarCandidatos();
    });
  }

  cargarCandidatos() {
    this.candidatoService.getCandidatosPorEleccion(this.eleccionId).subscribe(
      (candidatos) => {
        this.candidatos = candidatos;
      },
      (error) => {
        console.error('Error al cargar los candidatos', error);
        this.toastr.error('No se pudieron cargar los candidatos', 'Error');
      }
    );
  }

  confirmarVoto() {
    if (this.candidatoSeleccionadoId) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: "Una vez emitido el voto, no podrás cambiarlo.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, votar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.emitirVoto();
        }
      });
    } else {
      this.toastr.warning('Por favor, selecciona un candidato antes de votar', 'Atención');
    }
  }

  emitirVoto() {
    if (!this.usuarioId) {
      this.toastr.error('No se pudo identificar al usuario', 'Error');
      return;
    }

    const voto = {
      Usuarios_id: this.usuarioId,
      Candidato_id: this.candidatoSeleccionadoId,
      Eleccion_id: this.eleccionId
    };


    this.votoService.emitirVoto(voto).subscribe(
      (response) => {
        console.log('Voto emitido con éxito', response);
        Swal.fire(
          '¡Voto emitido!',
          'Tu voto ha sido registrado con éxito.',
          'success'
        );
        this.router.navigate(['/menu-voto']);
      },
      (error) => {
        console.error('Error al emitir el voto', error);
        let errorMessage = 'No se pudo emitir el voto';
        if (error.error && error.error.msg) {
          errorMessage = error.error.msg;
        }
        this.toastr.error(errorMessage, 'Error');
      }
    );
  }
}