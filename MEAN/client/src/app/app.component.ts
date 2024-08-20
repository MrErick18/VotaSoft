import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms'; // Importa ReactiveFormsModule

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule], // Agrega ReactiveFormsModule aquí
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // Asegúrate de usar 'styleUrls' en lugar de 'styleUrl'
})
export class AppComponent {
  title = 'client';
}
