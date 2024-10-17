import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule} from '@angular/forms';
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
  tiposEleccion: string[] = [
    'Presidencial', 'Congresional', 'Municipal', 'Gobernador', 'Alcalde',
    'Consejo', 'Junta directiva', 'Representante estudiantil', 'Comité de empresa', 'Vocero'
  ];
  estadosEleccion: string[] = ['Pendiente', 'En Curso', 'Finalizada'];

  constructor(
    private fb: FormBuilder,
    private eleccionService: EleccionService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.eleccionForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100), this.noWhitespaceValidator]],
      tipo: ['', [Validators.required, this.validTipoEleccion.bind(this)]],
      fecha: ['', [Validators.required, this.fechaFuturaValidator()]],
      estado: ['', [Validators.required, this.validEstadoEleccion.bind(this)]]
    });
  }

  ngOnInit(): void {
    this.eleccionId = this.route.snapshot.paramMap.get('id');
    if (this.eleccionId) {
      this.isEditMode = true;
      this.loadEleccionData();
    }

    this.minDate = new Date().toISOString().split('T')[0];
    this.eleccionForm.get('fecha')?.valueChanges.subscribe(() => {
      this.updateEstado();
    });
  }

  loadEleccionData(): void {
    this.eleccionService.getEleccion(this.eleccionId!).subscribe(
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

  formatFecha(fecha: string): string {
    return moment(fecha).format('YYYY-MM-DD');
  }

  updateEstado(): void {
    const fechaControl = this.eleccionForm.get('fecha');
    const estadoControl = this.eleccionForm.get('estado');
    
    if (fechaControl && estadoControl) {
      const fecha = new Date(fechaControl.value);
      const hoy = new Date();
      hoy.setUTCHours(0, 0, 0, 0);

      if (fecha < hoy) {
        estadoControl.setValue('Finalizada');
      } else if (fecha.toDateString() === hoy.toDateString()) {
        estadoControl.setValue('En Curso');
      } else {
        estadoControl.setValue('Pendiente');
      }
      
      estadoControl.updateValueAndValidity();
    }
  }

  checkEstado(): void {
    const estado = this.eleccionForm.get('estado')?.value;
    const controls = this.eleccionForm.controls;

    if (estado === 'En Curso' || estado === 'Finalizada') {
      Object.keys(controls).forEach(key => {
        controls[key].disable();
      });
    } else {
      Object.keys(controls).forEach(key => {
        controls[key].enable();
      });
    }
  }

  onSubmit(): void {
    if (this.eleccionForm.invalid) {
      this.toastr.error('Por favor, completa todos los campos requeridos correctamente.');
      this.markFormGroupTouched(this.eleccionForm);
      return;
    }

    if (this.isEditMode && (this.eleccionForm.get('estado')?.value !== 'Pendiente' || this.eleccionForm.get('estado')?.disabled)) {
      this.toastr.error('Solo se pueden actualizar elecciones en estado Pendiente.');
      return;
    }

    const fechaSeleccionada = moment.tz(this.eleccionForm.get('fecha')?.value, 'America/Bogota').startOf('day').toISOString();
    const formValue = { ...this.eleccionForm.value, fecha: fechaSeleccionada };

    if (this.isEditMode && this.eleccionId) {
      this.updateEleccion(formValue);
    } else {
      this.createEleccion(formValue);
    }
  }

  updateEleccion(formValue: any): void {
    this.eleccionService.actualizarEleccion(this.eleccionId!, formValue).subscribe(
      () => {
        this.toastr.success('Elección actualizada con éxito');
        this.router.navigate(['lista-eleccion']);
      },
      (error) => {
        this.toastr.error('Error al actualizar la elección');
      }
    );
  }

  createEleccion(formValue: any): void {
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

  volverALista(): void {
    this.router.navigate(['lista-eleccion']);
  }

  // Validation methods
  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { 'whitespace': true } : null;
  }

  fechaFuturaValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const inputDate = new Date(control.value);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      if (inputDate <= currentDate) {
        return { 'fechaPasada': true };
      }
      return null;
    };
  }

  validTipoEleccion(control: AbstractControl): ValidationErrors | null {
    return this.tiposEleccion.includes(control.value) ? null : { 'tipoInvalido': true };
  }

  validEstadoEleccion(control: AbstractControl): ValidationErrors | null {
    return this.estadosEleccion.includes(control.value) ? null : { 'estadoInvalido': true };
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.eleccionForm.get(controlName);
    if (control?.errors) {
      if (control.errors['required']) {
        return `El campo ${controlName} es requerido.`;
      }
      if (control.errors['minlength']) {
        return `El campo ${controlName} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
      }
      if (control.errors['maxlength']) {
        return `El campo ${controlName} no puede tener más de ${control.errors['maxlength'].requiredLength} caracteres.`;
      }
      if (control.errors['whitespace']) {
        return `El campo ${controlName} no puede estar vacío o contener solo espacios en blanco.`;
      }
      if (control.errors['fechaPasada']) {
        return 'La fecha debe ser posterior a la fecha actual.';
      }
      if (control.errors['tipoInvalido']) {
        return 'El tipo de elección seleccionado no es válido.';
      }
      if (control.errors['estadoInvalido']) {
        return 'El estado de elección seleccionado no es válido.';
      }
    }
    return '';
  }
}