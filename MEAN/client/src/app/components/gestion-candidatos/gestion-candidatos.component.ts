import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CandidatoService } from '../../services/candidato.service';
import { EleccionService } from '../../services/eleccion.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
    private router: Router
  ) {
    this.candidatoForm = this.fb.group({
      nombreCompleto: ['', Validators.required],
      perfil: ['', Validators.required],
      propuestas: ['', Validators.required],
      foto: ['', Validators.required],
      eleccion: ['', Validators.required] // Nuevo campo para la elección
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
        // Aquí puedes agregar lógica adicional para manejar el error, como mostrar un mensaje al usuario
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
        alert('Solo se permiten archivos de imagen (JPG, JPEG, PNG)');
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
      alert('Por favor, completa todos los campos requeridos.');
      return;
    }

    const candidatoData = this.candidatoForm.value;

    if (this.isEditMode && this.candidatoId) {
      this.candidatoService.actualizarCandidato(this.candidatoId, candidatoData)
        .subscribe(
          () => {
            alert('Candidato actualizado con éxito');
            this.router.navigate(['lista-candidato']);
          },
          (error) => {
            console.error('Error al actualizar candidato:', error);
            alert('Error al actualizar candidato. Por favor, intenta de nuevo.');
          }
        );
    } else {
      this.candidatoService.crearCandidato(candidatoData)
        .subscribe(
          () => {
            alert('Candidato creado con éxito');
            this.router.navigate(['lista-candidato']);
          },
          (error) => {
            console.error('Error al crear candidato:', error);
            alert('Error al crear candidato. Por favor, intenta de nuevo.');
          }
        );
    }
  }
}