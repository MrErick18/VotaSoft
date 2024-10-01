import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UsuariosService } from '../../services/usuarios.service';
import { EleccionService } from '../../services/eleccion.service';

@Component({
  selector: 'app-menu-voto',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './menu-voto.component.html',
  styleUrls: ['./menu-voto.component.css']
})
export class MenuVotoComponent implements OnInit{
  eleccionesPendientes: any[] = [];
  eleccionId: string = '';
  eleccionSeleccionada: boolean = false;
  tipoDoc: string = '';
  numDoc: string = '';
  verificationCode: string = '';
  userInputCode: string = '';
  showCodeInput: boolean = false;
  usuarioId: string = '';

  constructor(
    private usuariosService: UsuariosService,
    private eleccionService: EleccionService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarEleccionesPendientes();
  }

  cargarEleccionesPendientes() {
    this.eleccionService.getEleccionesPendientes().subscribe(
      (elecciones) => {
        this.eleccionesPendientes = elecciones;
      },
      (error) => {
        console.error('Error al cargar elecciones pendientes:', error);
        this.toastr.error('No se pudieron cargar las elecciones pendientes.');
      }
    );
  }

  onEleccionChange() {
    if (this.eleccionId) {
      this.eleccionSeleccionada = true;
    }
  }

  onSubmit() {
    if (!this.eleccionId) {
      this.toastr.warning('Por favor, seleccione una elección.');
      return;
    }
    if (!this.tipoDoc || !this.numDoc) {
      this.toastr.warning('Por favor complete todos los campos.');
      return;
    }

    this.usuariosService.validarUsuario(this.tipoDoc, this.numDoc).subscribe(
      (response) => {
        if (response && response._id) {
          this.usuarioId = response._id; // Guardamos el ID del usuario
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
    this.usuariosService.generarCodigoVerificacion(this.tipoDoc, this.numDoc, this.eleccionId).subscribe(
      (response) => {
        this.verificationCode = response.codigo;
        this.toastr.success('Código de verificación generado. Por favor, cópielo e ingréselo en el campo correspondiente.');
      },
      (error) => {
        console.error(error);
        if (error.status === 400 && error.error.msg === "Ya has votado en esta elección") {
          this.toastr.warning('Ya has participado en esta elección. Por favor, selecciona otra elección si deseas votar.');
        } else {
          this.toastr.error('Ocurrió un error al generar el código de verificación.');
        }
      }
    );
  }

  verifyCode() {
    if (!this.userInputCode) {
      this.toastr.warning('Por favor, ingrese el código de verificación.');
      return;
    }
  
    this.usuariosService.verificarCodigo(this.tipoDoc, this.numDoc, this.userInputCode, this.eleccionId).subscribe(
      (response) => {
        this.toastr.success('Código verificado correctamente.');
        // Pasamos el ID del usuario y el ID de la elección como parámetros de ruta
        this.router.navigate(['ingreso-voto', this.eleccionId, this.usuarioId]);
      },
      (error) => {
        console.error('Error detallado:', error);
        if (error.error && error.error.msg) {
          this.toastr.error(error.error.msg);
        } else {
          this.toastr.error('Ocurrió un error al verificar el código.');
        }
      }
    );
  }

  copyCode() {
    navigator.clipboard.writeText(this.verificationCode).then(() => {
      this.toastr.success('Código copiado al portapapeles.');
    });
  }

  goBack() {
    this.eleccionSeleccionada = false;
    this.showCodeInput = false;
    this.verificationCode = '';
    this.userInputCode = '';
    this.tipoDoc = '';
    this.numDoc = '';
  }
}