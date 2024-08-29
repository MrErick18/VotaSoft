import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule // Agregar HttpClientModule aquí
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService // Inyectar ToastrService
  ) {
    this.loginForm = this.formBuilder.group({
      numDoc: ['', [Validators.required]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { numDoc, contrasena } = this.loginForm.value;
      this.authService.login(numDoc, contrasena).subscribe(
        response => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            this.toastr.success('Inicio de sesión exitoso', 'Bienvenido');
            this.router.navigate(['/menu-principal']); // Cambia a la ruta que desees
          } else {
            this.toastr.error('Error de autenticación', 'Inicio de sesión fallido');
          }
        },
        error => {
          this.toastr.error('Error de autenticación', 'Inicio de sesión fallido');
          console.error('Error de autenticación', error);
        }
      );
    } else {
      this.toastr.warning('Por favor, completa todos los campos', 'Formulario no válido');
      console.error('Formulario no válido');
    }
  }
}
