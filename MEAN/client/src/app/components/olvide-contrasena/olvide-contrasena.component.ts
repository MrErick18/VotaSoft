import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdministradorService } from '../../services/administrador.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-olvide-contrasena',
  standalone: true,
  templateUrl: './olvide-contrasena.component.html',
  styleUrls: ['./olvide-contrasena.component.css'],
  imports: [FormsModule],
  providers: [AdministradorService, ToastrService]
})
export class OlvideContrasenaComponent {
  correo: string = '';

  constructor(
    private administradorService: AdministradorService,
    private toastr: ToastrService
  ) {}

  enviarCorreo() {
    if (!this.correo) {
      this.toastr.warning('Por favor, ingrese su correo electrónico');
      return;
    }
  
    this.administradorService.verificarCorreo(this.correo).subscribe(
      (response) => {
        if (response.exists) { // Revisa si el correo está registrado
          this.administradorService.enviarCorreoRecuperacion(this.correo).subscribe(
            () => {
              this.toastr.success('Correo de recuperación enviado');
            },
            (error) => {
              this.toastr.error('Error al enviar el correo de recuperación');
              console.error('Error al enviar el correo:', error);
            }
          );
        } else {
          this.toastr.warning('El correo no está registrado en el sistema'); // Mensaje si el correo no está registrado
        }
      },
      (error) => {
        this.toastr.error('Error al verificar el correo');
        console.error('Error al verificar el correo:', error);
      }
    );
  }
  
}
