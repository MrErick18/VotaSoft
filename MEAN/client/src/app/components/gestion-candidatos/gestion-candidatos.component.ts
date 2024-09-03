import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CandidatoService } from '../../services/candidato.service';
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
  fotoPreview: string | ArrayBuffer | null = ''; // Para almacenar la vista previa de la imagen

  constructor(
    private fb: FormBuilder,
    private candidatoService: CandidatoService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Configuración del formulario con validaciones
    this.candidatoForm = this.fb.group({
      nombreCompleto: ['', Validators.required],
      perfil: ['', Validators.required],
      propuestas: ['', Validators.required],
      foto: ['', Validators.required] // Campo obligatorio para la foto
    });
  }

  ngOnInit(): void {
    this.candidatoId = this.route.snapshot.paramMap.get('id');
    if (this.candidatoId) {
      this.isEditMode = true;
      this.candidatoService.getCandidato(this.candidatoId).subscribe((data) => {
        this.candidatoForm.patchValue(data);
        this.fotoPreview = data.foto; // Si ya existe una foto, la muestra
      });
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Verifica si el archivo es una imagen válida
      const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validImageTypes.includes(file.type)) {
        alert('Solo se permiten archivos de imagen (JPG, JPEG, PNG)');
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        this.fotoPreview = reader.result; // Almacena la vista previa de la foto
        this.candidatoForm.patchValue({
          foto: reader.result // Actualiza el campo 'foto' en el formulario
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

    if (this.isEditMode && this.candidatoId) {
      // Actualiza un candidato existente
      this.candidatoService.actualizarCandidato(this.candidatoId, this.candidatoForm.value)
        .subscribe(() => {
          alert('Candidato actualizado con éxito');
          this.router.navigate(['lista-candidato']); // Redirige a la lista de candidatos
        });
    } else {
      // Crea un nuevo candidato
      this.candidatoService.crearCandidato(this.candidatoForm.value)
        .subscribe(() => {
          alert('Candidato creado con éxito');
          this.router.navigate(['lista-candidato']); // Redirige a la lista de candidatos
        });
    }
  }
}
