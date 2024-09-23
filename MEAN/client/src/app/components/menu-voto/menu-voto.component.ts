import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-menu-voto',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './menu-voto.component.html',
  styleUrls: ['./menu-voto.component.css']
})
export class MenuVotoComponent {
  tipoDoc: string = '';
  numDoc: string = '';
  verificationCode: string = '';
  userInputCode: string = '';
  showCodeInput: boolean = false;

  constructor(
    private usuariosService: UsuariosService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.tipoDoc || !this.numDoc) {
      this.toastr.warning('Por favor complete todos los campos.');
      return;
    }

    this.usuariosService.validarUsuario(this.tipoDoc, this.numDoc).subscribe(
      (response) => {
        if (response && response._id) {
          this.showCodeInput = true;
          this.toastr.success('Usuario validado. Por favor, obtenga su código de verificación.');
        } else {
          this.toastr.warning('Usuario no encontrado.');
        }
      },
      (error) => {
        console.error(error);
        this.toastr.error('Ocurrió un error al validar el usuario.');
      }
    );
  }

  getVerificationCode() {
    this.usuariosService.generarCodigoVerificacion(this.tipoDoc, this.numDoc).subscribe(
      (response) => {
        this.verificationCode = response.codigo;
        this.toastr.success('Código de verificación generado. Por favor, cópielo e ingréselo en el campo correspondiente.');
      },
      (error) => {
        console.error(error);
        this.toastr.error('Ocurrió un error al generar el código de verificación.');
      }
    );
  }

  verifyCode() {
    if (!this.userInputCode) {
      this.toastr.warning('Por favor, ingrese el código de verificación.');
      return;
    }

    this.usuariosService.verificarCodigo(this.tipoDoc, this.numDoc, this.userInputCode).subscribe(
      (response) => {
        this.toastr.success('Código verificado correctamente.');
        this.router.navigate(['/ingreso-voto']);
      },
      (error) => {
        console.error(error);
        this.toastr.error('Código incorrecto o expirado. Por favor, intente de nuevo.');
      }
    );
  }

  copyCode() {
    navigator.clipboard.writeText(this.verificationCode).then(() => {
      this.toastr.success('Código copiado al portapapeles.');
    });
  }

  goBack() {
    this.showCodeInput = false;
    this.verificationCode = '';
    this.userInputCode = '';
  }
}