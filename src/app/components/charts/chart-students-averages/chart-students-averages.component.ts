import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { Component, computed, effect, inject, Input } from '@angular/core';
import { Trainee } from '../../../models/trainee.model';
import { ChartsUtilService } from '../../../features/analysis-page/charts-util.service';

@Component({
  selector: 'app-chart-students-averages',
  standalone: true,
  imports: [
    NgFor,NgIf
  ],
  templateUrl: './chart-students-averages.component.html',
  styleUrl: './chart-students-averages.component.scss'
})
export class ChartStudentsAveragesComponent {
  
  @Input() selectedTrainee: Trainee[] = [];
  chartsUtilService = inject(ChartsUtilService);

  get selectedIdNames(): string[]  {
    return this.chartsUtilService.formatSelected(this.selectedTrainee);
  }

  // Simple function to generate different colors for different bars
  getBarColor(index: number): string {
    const colors = ['#3f51b5', '#f44336', '#4caf50', '#ff9800', '#2196f3'];
    return colors[index % colors.length];
  }
}
