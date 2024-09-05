import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EleccionService } from '../../services/eleccion.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gestion-eleccion',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './gestion-eleccion.component.html',
  styleUrls: ['./gestion-eleccion.component.css']
})
export class GestionEleccionComponent implements OnInit {
  eleccionForm: FormGroup;
  eleccionId: string | null = null;
  isEditMode: boolean = false;
  minDate: string = ''; // Inicializar con un valor vacío

  constructor(
    private fb: FormBuilder,
    private eleccionService: EleccionService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.eleccionForm = this.fb.group({
      nombre: ['', Validators.required],
      tipo: ['', Validators.required],
      fecha: ['', Validators.required],
      estado: [{ value: '', disabled: true }, Validators.required]
    });
  }

  ngOnInit(): void {
    this.eleccionId = this.route.snapshot.paramMap.get('id');
    if (this.eleccionId) {
      this.isEditMode = true;
      this.eleccionService.getEleccion(this.eleccionId).subscribe(
        (data) => {
          this.eleccionForm.patchValue(data);
          this.updateEstado();
        },
        (error) => {
          this.toastr.error('Error al cargar los datos de la elección');
        }
      );
    }

    // Establecer la fecha mínima permitida
    this.minDate = new Date().toISOString().split('T')[0];
  }

  updateEstado(): void {
    const fecha = new Date(this.eleccionForm.get('fecha')?.value);
    const hoy = new Date();
    
    if (fecha < hoy) {
      this.eleccionForm.get('estado')?.setValue('Finalizada');
    } else if (fecha.toDateString() === hoy.toDateString()) {
      this.eleccionForm.get('estado')?.setValue('En Curso');
    } else {
      this.eleccionForm.get('estado')?.setValue('Pendiente');
    }
  }

  onSubmit(): void {
    if (this.eleccionForm.invalid) {
      this.toastr.error('Por favor, completa todos los campos requeridos.');
      return;
    }

    if (this.isEditMode && this.eleccionId) {
      this.eleccionService.actualizarEleccion(this.eleccionId, this.eleccionForm.value).subscribe(
        () => {
          this.toastr.success('Elección actualizada con éxito');
          this.router.navigate(['lista-eleccion']);
        },
        (error) => {
          this.toastr.error('Error al actualizar la elección');
        }
      );
    } else {
      this.eleccionService.crearEleccion(this.eleccionForm.value).subscribe(
        () => {
          this.toastr.success('Elección creada con éxito');
          this.router.navigate(['lista-eleccion']);
        },
        (error) => {
          this.toastr.error('Error al crear la elección');
        }
      );
    }
  }
}
