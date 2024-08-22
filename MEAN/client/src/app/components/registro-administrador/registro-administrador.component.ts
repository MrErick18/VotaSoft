import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AdministradorService } from '../../services/administrador.service';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-registro-administrador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro-administrador.component.html',
  styleUrls: ['./registro-administrador.component.css'],
})
export class RegistroAdministradorComponent {
  adminForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private administradorService: AdministradorService
  ) {
    this.adminForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      tipoDoc: ['', Validators.required],
      numDoc: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required],
      cargo: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.adminForm.valid) {
      const numDoc = this.adminForm.get('numDoc')?.value;
      
      this.administradorService.verificarNumeroDocumento(numDoc).subscribe(
        existe => {
          if (existe) {
            this.toastr.error('El número de documento ya está en uso', 'Error');
          } else {
            this.administradorService.agregarAdministrador(this.adminForm.value).subscribe(
              response => {
                this.toastr.success('Administrador registrado exitosamente', 'Éxito');
                setTimeout(() => {
                  this.router.navigate(['/login']);
                }, 2000);
              },
              error => {
                this.toastr.error('Error al registrar administrador', 'Error');
              }
            );
          }
        },
        error => {
          this.toastr.error('Error al verificar el número de documento', 'Error');
        }
      );
    } else {
      this.toastr.warning('Por favor, complete todos los campos', 'Advertencia');
    }
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}