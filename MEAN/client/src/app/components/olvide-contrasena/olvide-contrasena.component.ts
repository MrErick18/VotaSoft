import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdministradorService } from '../../services/administrador.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-olvide-contrasena',
  standalone: true,
  templateUrl: './olvide-contrasena.component.html',
  styleUrls: ['./olvide-contrasena.component.css'],
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  providers: [AdministradorService, ToastrService]
})
export class OlvideContrasenaComponent implements OnInit {
  correo: string = '';
  enviadoExito: boolean = false;
  errorEnviando: boolean = false;
  token: string | null = null;
  nuevaContrasena: string = '';

  constructor(
    private administradorService: AdministradorService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener el token de la URL
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  enviarCorreo() {
    if (!this.correo) {
      this.toastr.warning('Por favor, ingrese su correo electrónico');
      return;
    }
  
    this.administradorService.verificarCorreo(this.correo).subscribe(
      () => {
        this.enviadoExito = true;
        this.errorEnviando = false;
        this.toastr.success('Correo de recuperación enviado');
      },
      (error) => {
        this.enviadoExito = false;
        this.errorEnviando = true;
        this.toastr.error('Error al enviar el correo de recuperación');
        console.error('Error al enviar el correo:', error);
      }
    );
  }

  restablecerContrasena() {
    if (!this.nuevaContrasena || !this.token) {
      this.toastr.warning('Por favor, ingrese una nueva contraseña válida');
      return;
    }

    this.administradorService.restablecerContrasena(this.token, this.nuevaContrasena).subscribe(
      () => {
        this.toastr.success('Contraseña restablecida correctamente');
        this.router.navigate(['/login']);
      },
      (error) => {
        this.toastr.error('Error al restablecer la contraseña');
        console.error('Error al restablecer la contraseña:', error);
      }
    );
  }

  volverAlInicio() {
    this.router.navigate(['/']);
  }
}
