import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EleccionService } from '../../services/eleccion.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import moment from 'moment';
import 'moment-timezone';

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
  minDate: string = '';

  constructor(
    private fb: FormBuilder,
    private eleccionService: EleccionService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.eleccionForm = this.fb.group({
      nombre: [{ value: '', disabled: false }, Validators.required],
      tipo: [{ value: '', disabled: false }, Validators.required],
      fecha: [{ value: '', disabled: false }, Validators.required],
      estado: [{ value: '', disabled: false }, Validators.required]
    });
  }

  ngOnInit(): void {
    this.eleccionId = this.route.snapshot.paramMap.get('id');
    if (this.eleccionId) {
      this.isEditMode = true;
      this.eleccionService.getEleccion(this.eleccionId).subscribe(
        (data) => {
          this.eleccionForm.patchValue({
            ...data,
            fecha: this.formatFecha(data.fecha)
          });
          this.updateEstado();
          this.checkEstado();
        },
        (error) => {
          this.toastr.error('Error al cargar los datos de la elección');
        }
      );
    }

    // Establecer la fecha mínima permitida
    this.minDate = new Date().toISOString().split('T')[0];
    this.eleccionForm.get('fecha')?.valueChanges.subscribe(() => {
      this.updateEstado();
    });
  }

  formatFecha(fecha: string): string {
    return moment(fecha).format('YYYY-MM-DD');
  }

  updateEstado(): void {
    const fecha = new Date(this.eleccionForm.get('fecha')?.value);
    const hoy = new Date();
    hoy.setUTCHours(0, 0, 0, 0); // Ajusta la fecha de hoy para que sea UTC sin la parte de hora

    const estadoControl = this.eleccionForm.get('estado');

    if (estadoControl) {
      if (fecha < hoy) {
        estadoControl.setValue('Finalizada');
      } else if (fecha.toDateString() === hoy.toDateString()) {
        estadoControl.setValue('En Curso');
      } else {
        estadoControl.setValue('Pendiente');
      }
    }
  }

  checkEstado(): void {
    const estado = this.eleccionForm.get('estado')?.value;
    const controls = this.eleccionForm.controls;

    if (estado === 'En Curso' || estado === 'Finalizada') {
      for (const key in controls) {
        if (controls.hasOwnProperty(key)) {
          controls[key].disable(); // Deshabilitar todos los campos
        }
      }
    } else {
      for (const key in controls) {
        if (controls.hasOwnProperty(key)) {
          controls[key].enable(); // Habilitar todos los campos
        }
      }
    }
  }

  onSubmit(): void {
    if (this.eleccionForm.invalid) {
      this.toastr.error('Por favor, completa todos los campos requeridos.');
      return;
    }

    // Solo permitir la actualización si el estado es "Pendiente"
    if (this.isEditMode && (this.eleccionForm.get('estado')?.value !== 'Pendiente' || this.eleccionForm.get('estado')?.disabled)) {
      this.toastr.error('Solo se pueden actualizar elecciones en estado Pendiente.');
      return;
    }

    // Ajusta la fecha para la zona horaria de Colombia (UTC-5)
    const fechaSeleccionada = moment.tz(this.eleccionForm.get('fecha')?.value, 'America/Bogota').startOf('day').toISOString();
    const formValue = { ...this.eleccionForm.value, fecha: fechaSeleccionada };

    if (this.isEditMode && this.eleccionId) {
      this.eleccionService.actualizarEleccion(this.eleccionId, formValue).subscribe(
        () => {
          this.toastr.success('Elección actualizada con éxito');
          this.router.navigate(['lista-eleccion']);
        },
        (error) => {
          this.toastr.error('Error al actualizar la elección');
        }
      );
    } else {
      this.eleccionService.crearEleccion(formValue).subscribe(
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
