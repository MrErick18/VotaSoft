import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { AdministradorService } from '../../services/administrador.service';

@Component({
  selector: 'app-registro-administrador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro-administrador.component.html',
  styleUrls: ['./registro-administrador.component.css'],
})
export class RegistroAdministradorComponent implements OnInit {
  adminForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private administradorService: AdministradorService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.adminForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      tipoDoc: ['', Validators.required],
      numDoc: ['', [Validators.required, Validators.min(10000), Validators.max(9999999999)]],
      correo: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)]],
      contrasena: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator()]],
      cargo: ['', Validators.required]
    }, { validators: this.crossFieldValidator() });
  }

  private passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      const hasUpperCase = /[A-Z]+/.test(value);
      const hasLowerCase = /[a-z]+/.test(value);
      const hasNumeric = /[0-9]+/.test(value);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);
      const hasNoForbiddenChars = !/[<>]/.test(value);
      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && hasNoForbiddenChars;
      return passwordValid ? null : {'passwordStrength': {value: control.value}};
    };
  }

  private crossFieldValidator(): ValidatorFn {
    return (group: AbstractControl): {[key: string]: any} | null => {
      const nombre = group.get('nombre')?.value;
      const apellido = group.get('apellido')?.value;
      const contrasena = group.get('contrasena')?.value;
      if (!nombre || !apellido || !contrasena) {
        return null;
      }
      const containsName = contrasena.toLowerCase().includes(nombre.toLowerCase()) || 
                           contrasena.toLowerCase().includes(apellido.toLowerCase());
      return containsName ? {'passwordContainsName': true} : null;
    };
  }

  onSubmit(): void {
    if (this.adminForm.valid) {
      Swal.fire({
        title: '¿Está seguro?',
        text: 'Va a registrar un nuevo administrador',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, registrar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.registerAdministrator();
        }
      });
    } else {
      this.toastr.warning('Por favor, complete todos los campos correctamente', 'Formulario inválido');
      this.markFormGroupTouched(this.adminForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private registerAdministrator(): void {
    const numDoc = this.adminForm.get('numDoc')?.value;
    
    this.administradorService.verificarNumeroDocumento(numDoc).subscribe({
      next: (response) => {
        if (response.exists) {
          this.toastr.error('El número de documento ya está en uso', 'Error');
        } else {
          this.saveAdministrator();
        }
      },
      error: (error) => {
        this.toastr.error('Error al verificar el número de documento', 'Error');
        console.error('Error verifying document number:', error);
      }
    });
  }

  private saveAdministrator(): void {
    this.administradorService.agregarAdministrador(this.adminForm.value).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Administrador registrado exitosamente', 'success');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (error) => {
        this.toastr.error('Error al registrar administrador', 'Error');
        console.error('Error registering administrator:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }

  isInvalid(controlName: string): boolean {
    const control = this.adminForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.adminForm.get(controlName);
    return !!control && control.hasError(errorType) && (control.dirty || control.touched);
  }

  getErrorMessage(controlName: string): string {
    const control = this.adminForm.get(controlName);
    if (control?.errors) {
      if (control.errors['required']) return 'Este campo es requerido.';
      if (control.errors['minlength']) return `Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
      if (control.errors['pattern']) {
        switch(controlName) {
          case 'nombre':
          case 'apellido':
            return 'Solo se permiten letras y espacios.';
          case 'correo':
            return 'Ingrese un correo electrónico válido.';
        }
      }
      if (control.errors['email']) return 'Ingrese un correo electrónico válido.';
      if (control.errors['min']) return 'El número de documento debe ser mayor a 10000.';
      if (control.errors['max']) return 'El número de documento debe ser menor a 9999999999.';
      if (control.errors['passwordStrength']) return 'La contraseña debe contener al menos una mayúscula, una minúscula, un número, un carácter especial y no puede contener < o >.';
    }
    if (this.adminForm.hasError('passwordContainsName')) return 'La contraseña no puede contener su nombre o apellido.';
    return '';
  }
}