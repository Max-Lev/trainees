import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chart-grades-avg-subject',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart-grades-avg-subject.component.html',
  styleUrl: './chart-grades-avg-subject.component.scss'
})
export class ChartGradesAvgSubjectComponent {

  @Input() selectedSubjects: string[] = [];

  // Simple function to generate different colors for different pie segments
  getPieColor(index: number): string {
    const colors = ['#3f51b5', '#f44336', '#4caf50', '#ff9800', '#2196f3'];
    return colors[index % colors.length];
  }

}
