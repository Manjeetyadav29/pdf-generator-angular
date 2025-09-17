import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';

import { ChartData, ChartType } from 'chart.js';
import { ChartService, PopulationEntry } from './chart.service';

@Component({
  selector: 'app-chart-tab',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './chart-tab.component.html',
  styleUrls: ['./chart-tab.component.scss'],
})
export class ChartTabComponent implements OnInit {
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [{ data: [] }],
  };
  public pieChartType: ChartType = 'pie';
  public loading = true;
  public error: string | null = null;

  constructor(private chartService: ChartService) {}

  ngOnInit(): void {
    this.chartService.getPopulationData().subscribe({
      next: (data: PopulationEntry[]) => {
        this.pieChartData = {
          labels: data.map((d) => d.state),
          datasets: [{ data: data.map((d) => d.population) }],
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Chart data load failed', err);
        this.error = 'Failed to load data';
        this.loading = false;
      },
    });
  }
}
