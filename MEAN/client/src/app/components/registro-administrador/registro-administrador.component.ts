import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      tipoDoc: ['', Validators.required],
      numDoc: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      cargo: ['', Validators.required]
    });
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
    }
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
}