import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EleccionService } from '../../services/eleccion.service';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-lista-eleccion',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './lista-eleccion.component.html',
  styleUrls: ['./lista-eleccion.component.css']
})
export class ListaEleccionComponent implements OnInit {
  elecciones: any[] = [];

  constructor(private eleccionService: EleccionService, private router: Router, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.obtenerElecciones();
  }

  obtenerElecciones(): void {
    this.eleccionService.getElecciones().subscribe(
      data => {
        this.elecciones = data;
      },
      error => {
        this.toastr.error('Error al obtener las elecciones', 'Error');
      }
    );
  }

  crearEleccion(): void {
    this.router.navigate(['/gestion-eleccion']);
  }

  editarEleccion(id: string): void {
    this.router.navigate(['/gestion-eleccion', id]);
  }  

  eliminarEleccion(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta elección?')) {
      this.eleccionService.eliminarEleccion(id).subscribe(
        () => {
          this.toastr.success('Elección eliminada con éxito', 'Éxito');
          this.obtenerElecciones();
        },
        error => {
          this.toastr.error('Error al eliminar la elección', 'Error');
        }
      );
    }
  }
}
