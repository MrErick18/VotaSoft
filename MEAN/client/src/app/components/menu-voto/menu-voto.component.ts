import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { UsuariosService } from '../../services/usuarios.service';
import { EleccionService } from '../../services/eleccion.service';

@Component({
  selector: 'app-menu-voto',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './menu-voto.component.html',
  styleUrls: ['./menu-voto.component.css']
})
export class MenuVotoComponent implements OnInit {
  eleccionesEnCurso: any[] = [];
  eleccionId = '';
  eleccionSeleccionada = false;
  tipoDoc = '';
  numDoc = '';
  verificationCode = '';
  userInputCode = '';
  showCodeInput = false;
  usuarioId = '';
  isDarkTheme = false;

  constructor(
    private usuariosService: UsuariosService,
    private eleccionService: EleccionService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarEleccionesEnCurso();
    this.loadTheme();
  }

  loadTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark-theme') {
      this.isDarkTheme = true;
      document.documentElement.setAttribute('data-theme', 'dark-theme');
    }
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    const theme = this.isDarkTheme ? 'dark-theme' : 'light-theme';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  cargarEleccionesEnCurso() {
    this.eleccionService.getEleccionesPendientes().subscribe({
      next: (elecciones: any[]) => {
        this.eleccionesEnCurso = elecciones;
      },
      error: (error) => {
        console.error('Error al cargar elecciones en curso:', error);
        this.toastr.error('No se pudieron cargar las elecciones en curso.');
      }
    });
  }

  onEleccionChange() {
    this.eleccionSeleccionada = !!this.eleccionId;
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

    this.usuariosService.validarUsuario(this.tipoDoc, this.numDoc).subscribe({
      next: (response) => {
        if (response && response._id) {
          this.usuarioId = response._id;
          this.showCodeInput = true;
          this.toastr.success('Usuario validado. Por favor, obtenga su código de verificación.');
        } else {
          this.toastr.warning('Usuario no encontrado.');
        }
      },
      error: (error) => {
        console.error(error);
        this.toastr.error('Ocurrió un error al validar el usuario.');
      }
    });
  }

  getVerificationCode() {
    this.usuariosService.generarCodigoVerificacion(this.tipoDoc, this.numDoc, this.eleccionId).subscribe({
      next: (response) => {
        this.verificationCode = response.codigo;
        Swal.fire({
          title: 'Código de Verificación',
          text: `Su código es: ${this.verificationCode}`,
          icon: 'success',
          confirmButtonText: 'Copiar y Cerrar',
        }).then((result) => {
          if (result.isConfirmed) {
            this.copyCode();
          }
        });
      },
      error: (error) => {
        console.error(error);
        if (error.status === 400 && error.error.msg === "Ya has votado en esta elección") {
          Swal.fire('Advertencia', 'Ya has participado en esta elección. Por favor, selecciona otra elección si deseas votar.', 'warning');
        } else {
          this.toastr.error('Ocurrió un error al generar el código de verificación.');
        }
      }
    });
  }

  verifyCode() {
    if (!this.userInputCode) {
      this.toastr.warning('Por favor, ingrese el código de verificación.');
      return;
    }
  
    this.usuariosService.verificarCodigo(this.tipoDoc, this.numDoc, this.userInputCode, this.eleccionId).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Código verificado correctamente.', 'success').then(() => {
          this.router.navigate(['ingreso-voto', this.eleccionId, this.usuarioId]);
        });
      },
      error: (error) => {
        console.error('Error detallado:', error);
        Swal.fire('Error', error.error?.msg || 'Ocurrió un error al verificar el código.', 'error');
      }
    });
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