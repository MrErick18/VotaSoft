import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { EleccionService } from '../../services/eleccion.service';
import { VotoService } from '../../services/voto.service';
import { ResultadosService } from '../../services/resultados.service';
import { AuthService } from '../../services/auth.service';

Chart.register(...registerables);

interface Eleccion {
  _id: string;
  nombre: string;
  estado: string;
  fecha: string;
}

interface Voto {
  Candidato_id: {
    nombreCompleto: string;
  };
}

interface Resultado {
  nombre: string;
  votos: number;
}

interface Administrador {
  nombreCompleto: string;
  // Añada otras propiedades según sea necesario
}

@Component({
  selector: 'app-gestion-resultados',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './gestion-resultados.component.html',
  styleUrl: './gestion-resultados.component.css'
})
export class GestionResultadosComponent implements OnInit {
  @ViewChild('barChart') barChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart') pieChart!: ElementRef<HTMLCanvasElement>;

  elecciones: Eleccion[] = [];
  selectedEleccionId: string = '';
  eleccionActual: Eleccion | null = null;
  
  resultados: Resultado[] = [];
  ganador: Resultado | null = null;
  empate: boolean = false;
  empatados: Resultado[] = [];

  organizador: string = '';

  private barChartInstance: Chart | null = null;
  private pieChartInstance: Chart | null = null;
  private themeObserver: MutationObserver | null = null;

  constructor(
    private eleccionService: EleccionService,
    private votoService: VotoService,
    private resultadosService: ResultadosService,
    private authService: AuthService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    console.log('ngOnInit iniciado'); // Depuración
    this.cargarElecciones();
    this.observeThemeChanges();
    this.cargarNombreAdministrador();
  }

  ngOnDestroy() {
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
  }

  private observeThemeChanges() {
    this.themeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          this.ngZone.run(() => {
            this.updateChartColors();
            if (this.resultados.length > 0) {
              this.actualizarGraficos(this.resultados);
            }
          });
        }
      });
    });

    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  private updateChartColors() {
    Chart.defaults.color = this.obtenerColorTexto();
    Chart.defaults.borderColor = this.obtenerColorBorde();
  }

  cargarNombreAdministrador() {
    console.log('Iniciando cargarNombreAdministrador');
    this.authService.getAdministradorLogueado().subscribe({
      next: (admin) => {
        console.log('Respuesta de getAdministradorLogueado:', admin);
        if (admin.nombreCompleto && admin.nombreCompleto !== 'Administrador') {
          this.organizador = admin.nombreCompleto;
        } else if (admin.numDoc) {
          // Si no tenemos el nombre, intentamos obtenerlo del backend
          this.obtenerNombreAdministrador(admin.numDoc);
        } else {
          this.organizador = 'Administrador';
        }
        console.log('Nombre del administrador cargado:', this.organizador);
      },
      error: (error) => {
        console.error('Error al cargar el nombre del administrador:', error);
        this.organizador = 'Administrador';
      }
    });
  }
  
  obtenerNombreAdministrador(numDoc: string) {
    // Suponiendo que tienes un método en tu servicio para obtener los detalles del administrador
    this.authService.obtenerDetallesAdministrador(numDoc).subscribe({
      next: (detalles) => {
        this.organizador = detalles.nombreCompleto || `Administrador (${numDoc})`;
      },
      error: (error) => {
        console.error('Error al obtener detalles del administrador:', error);
        this.organizador = `Administrador (${numDoc})`;
      }
    });
  }

  cargarElecciones() {
    this.eleccionService.getElecciones().subscribe(
      (elecciones: Eleccion[]) => {
        console.log('Todas las elecciones recibidas:', elecciones);
        
        this.elecciones = elecciones.filter(e => 
          e.estado.toLowerCase().includes('en curso') || 
          e.estado.toLowerCase().includes('finalizada')
        );
        
        console.log('Elecciones filtradas:', this.elecciones);
      },
      (error) => {
        console.error('Error al cargar elecciones:', error);
      }
    );
  }

  cargarResultados() {
    if (!this.selectedEleccionId) return;

    this.eleccionActual = this.elecciones.find(e => e._id === this.selectedEleccionId) || null;

    this.votoService.getVotosPorEleccion(this.selectedEleccionId).subscribe(
      (votos: Voto[]) => {
        this.resultados = this.procesarVotos(votos);
        this.actualizarGraficos(this.resultados);
        this.determinarGanador(this.resultados);
      },
      (error) => console.error('Error al cargar votos:', error)
    );
  }

  procesarVotos(votos: Voto[]): Resultado[] {
    const resultadosMap: { [key: string]: number } = {};
    votos.forEach(voto => {
      const nombreCandidato = voto.Candidato_id.nombreCompleto;
      resultadosMap[nombreCandidato] = (resultadosMap[nombreCandidato] || 0) + 1;
    });
    return Object.entries(resultadosMap)
      .map(([nombre, votos]) => ({ nombre, votos }))
      .sort((a, b) => b.votos - a.votos);
  }

  determinarGanador(resultados: Resultado[]) {
    if (resultados.length === 0) {
      this.ganador = null;
      this.empate = false;
      this.empatados = [];
      return;
    }

    const maxVotos = resultados[0].votos;
    this.empatados = resultados.filter(r => r.votos === maxVotos);

    if (this.empatados.length > 1) {
      this.empate = true;
      this.ganador = null;
    } else {
      this.empate = false;
      this.ganador = this.empatados[0];
      this.empatados = [];
    }
  }

  calcularPorcentaje(votos: number): number {
    const totalVotos = this.resultados.reduce((sum, r) => sum + r.votos, 0);
    return totalVotos > 0 ? votos / totalVotos : 0;
  }

  actualizarGraficos(resultados: Resultado[]) {
    const labels = resultados.map(r => r.nombre);
    const data = resultados.map(r => r.votos);

    this.actualizarGraficoBarras(labels, data);
    this.actualizarGraficoCircular(labels, data);
  }

  actualizarGraficoBarras(labels: string[], data: number[]) {
    if (this.barChartInstance) {
      this.barChartInstance.destroy();
    }
  
    const textColor = this.obtenerColorTexto();
    const bgColor = this.obtenerColorFondo();
    const borderColor = this.obtenerColorBorde();
  
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Votos',
          data: data,
          backgroundColor: this.obtenerColoresGrafico(data.length),
          borderColor: this.obtenerColoresGrafico(data.length, 1),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: textColor },
            grid: { color: borderColor },
            border: { color: borderColor }
          },
          x: {
            ticks: { color: textColor },
            grid: { color: borderColor },
            border: { color: borderColor }
          }
        },
        plugins: {
          legend: {
            labels: { color: textColor }
          },
          tooltip: {
            backgroundColor: bgColor,
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: borderColor,
            borderWidth: 1
          }
        }
      }
    };
  
    this.barChartInstance = new Chart(this.barChart.nativeElement, config);
  }
  
  actualizarGraficoCircular(labels: string[], data: number[]) {
    if (this.pieChartInstance) {
      this.pieChartInstance.destroy();
    }
  
    const textColor = this.obtenerColorTexto();
    const bgColor = this.obtenerColorFondo();
    const borderColor = this.obtenerColorBorde();
  
    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: this.obtenerColoresGrafico(data.length),
          borderColor: borderColor,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { 
              color: textColor,
              font: {
                size: 14
              }
            }
          },
          tooltip: {
            backgroundColor: bgColor,
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: borderColor,
            borderWidth: 1
          }
        }
      }
    };
  
    this.pieChartInstance = new Chart(this.pieChart.nativeElement, config);
  }

  obtenerColorTexto(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();
  }

  obtenerColorFondo(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim();
  }

  obtenerColorBorde(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();
  }

  obtenerColoresGrafico(cantidad: number, opacidad: number = 0.8): string[] {
    const coloresBase = [
      getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
      getComputedStyle(document.documentElement).getPropertyValue('--danger-button').trim(),
      getComputedStyle(document.documentElement).getPropertyValue('--botonverde').trim(),
      '#FFA500', // Naranja
      '#800080', // Púrpura
      '#40E0D0', // Turquesa
      '#FF6347', // Tomate
      '#6A5ACD', // Azul pizarra
      '#20B2AA', // Verde mar claro
      '#FF4500'  // Rojo naranja
    ];

    return Array.from({ length: cantidad }, (_, i) => {
      const color = coloresBase[i % coloresBase.length];
      return this.ajustarOpacidad(color, opacidad);
    });
  }

  ajustarOpacidad(color: string, opacidad: number): string {
    // Convertir el color hexadecimal a RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Devolver el color en formato RGBA
    return `rgba(${r}, ${g}, ${b}, ${opacidad})`;
  }

  descargarPDF() {
    if (this.eleccionActual && this.eleccionActual.estado === 'Finalizada') {
      const barChartImage = this.barChartInstance?.toBase64Image();
      const pieChartImage = this.pieChartInstance?.toBase64Image();

      const datosCompletos = {
        eleccionNombre: this.eleccionActual.nombre,
        resultados: this.resultados,
        ganador: this.ganador,
        empate: this.empate,
        empatados: this.empatados,
        barChartImage,
        pieChartImage,
        fechaEleccion: this.eleccionActual.fecha,
        lugarEleccion: 'Girardot, Cundinamarca',
        organizador: this.organizador
      };

      this.resultadosService.generarPDF(this.selectedEleccionId, datosCompletos).subscribe(
        (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `resultados_${this.eleccionActual?.nombre.replace(/\s+/g, '_')}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        (error) => console.error('Error al descargar PDF:', error)
      );
    }
  }
}