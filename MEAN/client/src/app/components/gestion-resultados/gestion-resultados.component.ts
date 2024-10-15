import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { EleccionService } from '../../services/eleccion.service';
import { VotoService } from '../../services/voto.service';
import { ResultadosService } from '../../services/resultados.service';

Chart.register(...registerables);

interface Eleccion {
  _id: string;
  nombre: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
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

  organizador: string = 'Nefertari Vivi';

  private barChartInstance: Chart | null = null;
  private pieChartInstance: Chart | null = null;

  constructor(
    private eleccionService: EleccionService,
    private votoService: VotoService,
    private resultadosService: ResultadosService
  ) {}

  ngOnInit() {
    this.cargarElecciones();
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
  
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();
  
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Votos',
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: textColor },
            grid: { color: borderColor }
          },
          x: {
            ticks: { color: textColor },
            grid: { color: borderColor }
          }
        },
        plugins: {
          legend: {
            labels: { color: textColor }
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
  
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();
  
    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: textColor }
          }
        }
      }
    };
  
    this.pieChartInstance = new Chart(this.pieChart.nativeElement, config);
  }

  // Método para actualizar los gráficos cuando cambia el tema
  actualizarGraficosPorTema() {
    if (this.resultados.length > 0) {
      const labels = this.resultados.map(r => r.nombre);
      const data = this.resultados.map(r => r.votos);
      this.actualizarGraficoBarras(labels, data);
      this.actualizarGraficoCircular(labels, data);
    }
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
        fechaEleccion: this.eleccionActual.fechaFin,
        lugarEleccion: 'Gran Line', // Asumiendo que este dato es constante
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