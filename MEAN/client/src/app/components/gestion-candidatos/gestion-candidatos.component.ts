import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CandidatoService } from '../../services/candidato.service';
import { EleccionService } from '../../services/eleccion.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-gestion-candidatos',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './gestion-candidatos.component.html',
  styleUrls: ['./gestion-candidatos.component.css']
})
export class GestionCandidatosComponent implements OnInit {
  candidatoForm: FormGroup;
  candidatoId: string | null = null;
  isEditMode: boolean = false;
  fotoPreview: string | ArrayBuffer | null = '';
  eleccionesPendientes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private candidatoService: CandidatoService,
    private eleccionService: EleccionService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.candidatoForm = this.fb.group({
      nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
      perfil: ['', [Validators.required, Validators.minLength(10)]],
      propuestas: [''], // Optional field
      foto: ['', Validators.required],
      eleccion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarEleccionesPendientes();
    this.candidatoId = this.route.snapshot.paramMap.get('id');
    if (this.candidatoId) {
      this.isEditMode = true;
      this.cargarDatosCandidato();
    }
  }

  cargarEleccionesPendientes(): void {
    this.eleccionService.getEleccionesPendientes().subscribe(
      (elecciones) => {
        this.eleccionesPendientes = elecciones;
      },
      (error) => {
        console.error('Error al cargar elecciones pendientes:', error);
        this.toastr.error('No se pudieron cargar las elecciones pendientes', 'Error');
      }
    );
  }

  obtenerNombreEleccion(eleccionId: string): string {
    const eleccion = this.eleccionesPendientes.find(e => e._id === eleccionId);
    return eleccion ? eleccion.nombre : 'No seleccionada';
  }

  cargarDatosCandidato(): void {
    if (this.candidatoId) {
      this.candidatoService.getCandidato(this.candidatoId).subscribe(
        (data) => {
          this.candidatoForm.patchValue(data);
          this.fotoPreview = data.foto;
        },
        (error) => {
          console.error('Error al cargar datos del candidato:', error);
          this.toastr.error('No se pudieron cargar los datos del candidato', 'Error');
        }
      );
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validImageTypes.includes(file.type)) {
        this.toastr.error('Solo se permiten archivos de imagen (JPG, JPEG, PNG)', 'Error');
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        this.fotoPreview = reader.result;
        this.candidatoForm.patchValue({
          foto: reader.result
        });
      };

      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.candidatoForm.invalid) {
      this.toastr.error('Por favor, completa todos los campos requeridos', 'Error');
      return;
    }

    const candidatoData = this.candidatoForm.value;

    Swal.fire({
      title: '¿Estás seguro?',
      text: this.isEditMode ? 'Se actualizarán los datos del candidato.' : 'Se registrará un nuevo candidato.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.isEditMode ? 'Sí, actualizar' : 'Sí, registrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.isEditMode && this.candidatoId) {
          this.actualizarCandidato(this.candidatoId, candidatoData);
        } else {
          this.crearCandidato(candidatoData);
        }
      }
    });
  }

  private actualizarCandidato(id: string, data: any): void {
    this.candidatoService.actualizarCandidato(id, data).subscribe(
      () => {
        Swal.fire('¡Éxito!', 'Candidato actualizado correctamente', 'success');
        this.router.navigate(['lista-candidato']);
      },
      (error) => {
        console.error('Error al actualizar candidato:', error);
        Swal.fire('Error', 'No se pudo actualizar el candidato', 'error');
      }
    );
  }

  private crearCandidato(data: any): void {
    this.candidatoService.crearCandidato(data).subscribe(
      () => {
        Swal.fire('¡Éxito!', 'Candidato registrado correctamente', 'success');
        this.router.navigate(['lista-candidato']);
      },
      (error) => {
        console.error('Error al crear candidato:', error);
        Swal.fire('Error', 'No se pudo registrar el candidato', 'error');
      }
    );
  }

  volverALista(): void {
    this.router.navigate(['lista-candidato']);
  }
}