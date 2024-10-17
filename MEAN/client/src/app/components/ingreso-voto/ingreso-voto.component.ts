import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CandidatoService } from '../../services/candidato.service';
import { VotoService } from '../../services/voto.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subject, takeUntil, finalize } from 'rxjs';

interface Candidato {
  _id: string;
  nombreCompleto: string;
  perfil: string;
  propuestas: string;
  foto: string;
}

@Component({
  selector: 'app-ingreso-voto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ingreso-voto.component.html',
  styleUrls: ['./ingreso-voto.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class IngresoVotoComponent implements OnInit, OnDestroy {
  candidatos: Candidato[] = [];
  candidatoSeleccionadoId: string = '';
  eleccionId: string = '';
  usuarioId: string = '';
  loading: boolean = true;
  votoEnBlancoId: string = 'voto-en-blanco';
  private unsubscribe$ = new Subject<void>();

  constructor(
    private candidatoService: CandidatoService,
    private votoService: VotoService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.route.params.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(params => {
      this.eleccionId = params['eleccionId'];
      this.usuarioId = params['usuarioId'];
      this.cargarCandidatos();
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  cargarCandidatos() {
    this.loading = true;
    this.candidatoService.getCandidatosPorEleccion(this.eleccionId)
      .pipe(
        takeUntil(this.unsubscribe$),
        finalize(() => {
          this.loading = false;
          this.agregarVotoEnBlanco();
        })
      )
      .subscribe({
        next: (candidatos) => {
          this.candidatos = candidatos;
          this.toastr.success('Candidatos cargados correctamente', 'Éxito');
        },
        error: (error) => {
          console.error('Error al cargar los candidatos', error);
          this.toastr.error('No se pudieron cargar los candidatos', 'Error');
          Swal.fire('Error', 'Hubo un problema al cargar los candidatos. Por favor, intenta de nuevo más tarde.', 'error');
        }
      });
  }

  agregarVotoEnBlanco() {
    const votoEnBlanco: Candidato = {
      _id: this.votoEnBlancoId,
      nombreCompleto: 'Voto en Blanco',
      perfil: 'Opción para votar en blanco',
      propuestas: 'Esta opción representa un voto en blanco',
      foto: '/assets/voto-en-blanco.png'
    };
    this.candidatos.push(votoEnBlanco);
  }

  onCandidatoSelect(candidatoId: string) {
    this.candidatoSeleccionadoId = candidatoId;
    const candidatoSeleccionado = this.candidatos.find(c => c._id === candidatoId);
    if (candidatoSeleccionado) {
      this.toastr.info(`Has seleccionado: ${candidatoSeleccionado.nombreCompleto}`, 'Opción seleccionada');
    }
  }

  confirmarVoto() {
    if (this.candidatoSeleccionadoId) {
      const candidatoSeleccionado = this.candidatos.find(c => c._id === this.candidatoSeleccionadoId);
      const mensajeConfirmacion = this.candidatoSeleccionadoId === this.votoEnBlancoId
        ? '¿Estás seguro de que quieres emitir un voto en blanco?'
        : `Vas a votar por <strong>${candidatoSeleccionado?.nombreCompleto}</strong>.<br>Una vez emitido el voto, no podrás cambiarlo.`;

      Swal.fire({
        title: '¿Estás seguro?',
        html: mensajeConfirmacion,
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
      this.toastr.warning('Por favor, selecciona un candidato o voto en blanco antes de votar', 'Atención');
    }
  }

  emitirVoto() {
    if (!this.usuarioId) {
      this.toastr.error('No se pudo identificar al usuario', 'Error');
      return;
    }

    const voto = {
      Usuarios_id: this.usuarioId,
      Candidato_id: this.candidatoSeleccionadoId === this.votoEnBlancoId ? null : this.candidatoSeleccionadoId,
      Eleccion_id: this.eleccionId,
      esVotoEnBlanco: this.candidatoSeleccionadoId === this.votoEnBlancoId
    };

    Swal.fire({
      title: 'Emitiendo voto',
      text: 'Por favor, espera...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.votoService.emitirVoto(voto)
      .pipe(
        takeUntil(this.unsubscribe$),
        finalize(() => Swal.close())
      )
      .subscribe({
        next: (response) => {
          console.log('Voto emitido con éxito', response);
          Swal.fire(
            '¡Voto emitido!',
            'Tu voto ha sido registrado con éxito.',
            'success'
          );
          this.toastr.success('Tu voto ha sido registrado', 'Voto emitido');
          this.router.navigate(['/menu-voto']);
        },
        error: (error) => {
          console.error('Error al emitir el voto', error);
          let errorMessage = 'No se pudo emitir el voto';
          if (error.error && error.error.msg) {
            errorMessage = error.error.msg;
          }
          this.toastr.error(errorMessage, 'Error');
          Swal.fire('Error', 'Hubo un problema al emitir tu voto. Por favor, intenta de nuevo.', 'error');
        }
      });
  }
}