import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CandidatoService } from '../../services/candidato.service'; // Asegúrate de importar correctamente tu servicio
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-gestion-candidatos',
  standalone: true,
  imports: [],
  templateUrl: './gestion-candidatos.component.html',
  styleUrls: ['./gestion-candidatos.component.css']
})
export class GestionCandidatosComponent implements OnInit {
  candidatoForm: FormGroup;
  candidatoId: string | null = null;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private candidatoService: CandidatoService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.candidatoForm = this.fb.group({
      nombre: ['', Validators.required],
      perfil: ['', Validators.required],
      propuestas: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.candidatoId = this.route.snapshot.paramMap.get('id');
    if (this.candidatoId) {
      this.isEditMode = true;
      this.candidatoService.getCandidato(this.candidatoId).subscribe((data) => {
        this.candidatoForm.patchValue(data);
      });
    }
  }

  onSubmit(): void {
    if (this.isEditMode && this.candidatoId) {
      this.candidatoService.actualizarCandidato(this.candidatoId, this.candidatoForm.value)
        .subscribe(() => {
          alert('Candidato actualizado con éxito');
          this.router.navigate(['/lista-candidatos']); // Redirige a la lista de candidatos
        });
    } else {
      this.candidatoService.crearCandidato(this.candidatoForm.value)
        .subscribe(() => {
          alert('Candidato creado con éxito');
          this.router.navigate(['/lista-candidatos']); // Redirige a la lista de candidatos
        });
    }
  }
}
