import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chart-grades-average',
  standalone: true,
  imports: [],
  templateUrl: './chart-grades-avg-students.component.html',
  styleUrl: './chart-grades-avg-students.component.scss'
})
export class ChartGradesAverageStudetnsComponent {

  @Input() selectedIds: string[] = [];
  
  // Simple function to generate different colors for different lines
  getLineColor(index: number): string {
    const colors = ['#3f51b5', '#f44336', '#4caf50', '#ff9800', '#2196f3'];
    return colors[index % colors.length];
  }

}
