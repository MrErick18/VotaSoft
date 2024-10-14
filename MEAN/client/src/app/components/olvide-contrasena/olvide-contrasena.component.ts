import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { AdministradorService } from '../../services/administrador.service';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-olvide-contrasena',
  templateUrl: './olvide-contrasena.component.html',
  styleUrls: ['./olvide-contrasena.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class OlvideContrasenaComponent implements OnInit, OnDestroy {
  correoForm: FormGroup;
  contrasenaForm: FormGroup;
  token: string | null = null;
  enviadoExito: boolean = false;
  errorEnviando: boolean = false;
  private unsubscribe$ = new Subject<void>();

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

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  enviarCorreo(): void {
    if (this.correoForm.invalid) {
      this.toastr.warning('Por favor, ingrese un correo electrónico válido');
      return;
    }

    Swal.fire({
      title: 'Enviando correo',
      text: 'Por favor espere...',
      icon: 'info',
      allowOutsideClick: false,
      showConfirmButton: false
    });

    const correo = this.correoForm.get('correo')?.value;
    this.administradorService.verificarCorreo(correo)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          Swal.close();
          Swal.fire({
            title: '¡Éxito!',
            text: 'Correo de recuperación enviado',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          this.enviadoExito = true;
        },
        error: (error) => {
          Swal.close();
          Swal.fire({
            title: 'Error',
            text: 'Error al enviar el correo de recuperación',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          this.errorEnviando = true;
          console.error('Error al enviar el correo:', error);
        }
      });
  }

  restablecerContrasena(): void {
    if (this.contrasenaForm.invalid) {
      this.toastr.warning('Por favor, ingrese una nueva contraseña válida (mínimo 6 caracteres)');
      return;
    }

    Swal.fire({
      title: 'Restableciendo contraseña',
      text: 'Por favor espere...',
      icon: 'info',
      allowOutsideClick: false,
      showConfirmButton: false
    });

    const nuevaContrasena = this.contrasenaForm.get('nuevaContrasena')?.value;
    this.administradorService.restablecerContrasena(this.token!, nuevaContrasena)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          Swal.close();
          Swal.fire({
            title: '¡Éxito!',
            text: 'Contraseña restablecida correctamente',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/login']);
            }
          });
        },
        error: (error) => {
          Swal.close();
          Swal.fire({
            title: 'Error',
            text: 'Error al restablecer la contraseña',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          this.errorEnviando = true;
          console.error('Error al restablecer la contraseña:', error);
        }
      });
  }

  volverAlInicio(): void {
    this.router.navigate(['/']);
  }
}