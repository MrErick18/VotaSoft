import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { AdministradorService } from '../../services/administrador.service';
import { FormsModule } from '@angular/forms';  // Import FormsModule

@Component({
  selector: 'app-olvide-contrasena',
  templateUrl: './olvide-contrasena.component.html',
  styleUrls: ['./olvide-contrasena.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule
  ]
})
export class OlvideContrasenaComponent implements OnInit {
  correoForm: FormGroup;
  contrasenaForm: FormGroup;
  correo: string = '';
  nuevaContrasena: string = '';
  token: string | null = null;
  enviadoExito: boolean = false;
  errorEnviando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private administradorService: AdministradorService
  ) {
    this.correoForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]]
    });

    this.contrasenaForm = this.fb.group({
      nuevaContrasena: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  enviarCorreo(): void {
    if (!this.correo) {
      this.toastr.warning('Por favor, ingrese su correo electrónico');
      return;
    }

    this.administradorService.verificarCorreo(this.correo).subscribe(
      response => {
        this.toastr.success('Correo de recuperación enviado');
        this.enviadoExito = true;
      },
      error => {
        this.toastr.error('Error al enviar el correo de recuperación');
        this.errorEnviando = true;
        console.error('Error al enviar el correo:', error);
      }
    );
  }

  restablecerContrasena(): void {
    if (!this.nuevaContrasena || this.nuevaContrasena.length < 6) {
      this.toastr.warning('Por favor, ingrese una nueva contraseña válida');
      return;
    }

    this.administradorService.restablecerContrasena(this.token!, this.nuevaContrasena).subscribe(
      response => {
        this.toastr.success('Contraseña restablecida correctamente');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000); // Redirige después de 3 segundos
      },
      error => {
        this.toastr.error('Error al restablecer la contraseña');
        this.errorEnviando = true;
        console.error('Error al restablecer la contraseña:', error);
      }
    );
  }

  volverAlInicio(): void {
    this.router.navigate(['/']);
  }
}
