import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LegendPosition, NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-chart-subjects-avg',
  standalone: true,
  imports: [
    NgxChartsModule
  ],
  template: `
  <ngx-charts-pie-chart [results]="subjectAverages" [tooltipDisabled]="false" 
  [gradient]="gradient" [legend]="showLegend"
  [legendPosition]="legendPosition" [labels]="showLabels" [doughnut]="isDoughnut">
</ngx-charts-pie-chart>
  `,
  styleUrl: './chart-subjects-avg.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
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
