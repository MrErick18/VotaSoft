import { Component, OnInit } from '@angular/core';
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
    HttpClientModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.formBuilder.group({
      numDoc: ['', [Validators.required, Validators.pattern(/^\d{8,20}$/)]],
      contrasena: ['', [
        Validators.required, 
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
      ]]
    });
  }

  ngOnInit(): void {
    // Additional initialization if needed
  }

  get numDocControl() {
    return this.loginForm.get('numDoc');
  }

  get contrasenaControl() {
    return this.loginForm.get('contrasena');
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { numDoc, contrasena } = this.loginForm.value;
      this.authService.login(numDoc, contrasena).subscribe({
        next: (response) => {
          if (response.token) {
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.setItem('token', response.token);
            }
            this.toastr.success('Inicio de sesión exitoso', 'Bienvenido');
            this.router.navigate(['/menu-principal']);
          } else {
            this.toastr.error('Error de autenticación', 'Inicio de sesión fallido');
          }
        },
        error: (error) => {
          this.toastr.error('Error de autenticación', 'Inicio de sesión fallido');
          console.error('Error de autenticación', error);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.toastr.warning('Por favor, completa todos los campos correctamente', 'Formulario no válido');
    }
  }
}