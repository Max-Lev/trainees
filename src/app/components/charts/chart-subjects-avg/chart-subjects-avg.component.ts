import { Component, Input } from '@angular/core';
import { LegendPosition, NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-chart-subjects-avg',
  standalone: true,
  imports: [
    NgxChartsModule
  ],
  templateUrl: './chart-subjects-avg.component.html',
  styleUrl: './chart-subjects-avg.component.scss'
})
export class ChartSubjectsAvgComponent {

  @Input() xAxisLabel = '';
  @Input() yAxisLabel = '';
  @Input({ required: false }) subjectAverages: { name: string; value: number; }[] = [];

  // options
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;
  legendPosition = LegendPosition.Right


}
