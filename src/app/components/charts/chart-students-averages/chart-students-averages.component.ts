import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chart-students-averages',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './chart-students-averages.component.html',
  styleUrl: './chart-students-averages.component.scss'
})
export class ChartStudentsAveragesComponent {
  @Input() selectedIds: string[] = [];

  // Simple function to generate different colors for different bars
  getBarColor(index: number): string {
    const colors = ['#3f51b5', '#f44336', '#4caf50', '#ff9800', '#2196f3'];
    return colors[index % colors.length];
  }
}
