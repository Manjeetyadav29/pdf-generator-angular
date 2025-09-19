import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart,
  ChartConfiguration,
  ChartData,
  ChartType,
  registerables,
} from 'chart.js';
import { ChartService, PopulationEntry } from './chart.service';

Chart.register(...registerables);

@Component({
  selector: 'app-chart-tab',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './chart-tab.component.html',
  styleUrls: ['./chart-tab.component.scss'],
})
export class ChartTabComponent implements OnInit, AfterViewInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  public pieChartType: 'pie' = 'pie';

  public chartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.2,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
    layout: {
      padding: 10,
    },
  };

  public loading = true;
  public error: string | null = null;

  constructor(private chartService: ChartService) {}

  ngOnInit(): void {
    this.loadChartData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.chart) {
        this.chart.update();
      }
    }, 100);
  }

  private loadChartData(): void {
    this.chartService.getPopulationData().subscribe({
      next: (data: PopulationEntry[]) => {
        this.pieChartData = {
          labels: data.map((d) => d.state),
          datasets: [
            {
              ...this.pieChartData.datasets[0],
              data: data.map((d) => d.population),
            },
          ],
        };
        this.loading = false;

        setTimeout(() => {
          if (this.chart) {
            this.chart.update('none');
          }
        }, 50);
      },
      error: (err) => {
        console.error('Chart data load failed', err);
        this.error = 'Failed to load data';
        this.loading = false;
      },
    });
  }

  onResize(): void {
    if (this.chart) {
      this.chart.chart?.resize();
    }
  }
}
