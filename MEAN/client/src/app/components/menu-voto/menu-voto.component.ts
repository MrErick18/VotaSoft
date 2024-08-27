import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-menu-voto',
  standalone: true,
  imports: [FormsModule], // Importa FormsModule aquí
  templateUrl: './menu-voto.component.html',
  styleUrls: ['./menu-voto.component.css']
})
export class MenuVotoComponent {
  tipoDoc: string = '';
  numDoc: string = '';

  constructor(private usuariosService: UsuariosService, private toastr: ToastrService, private router: Router) {}

  onSubmit() {
    this.usuariosService.validarUsuario(this.tipoDoc, this.numDoc).subscribe(
      (response) => {
        if (response && response._id) {
          this.router.navigate(['/ingreso-voto']); // Cambia la ruta según tu necesidad
        } else {
          this.toastr.warning('Usuario no encontrado.');
        }
      },
      (error) => {
        this.toastr.error('Ocurrió un error al validar el usuario.');
      }
    );
  }
}
