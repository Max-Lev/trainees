import { Component, OnChanges, Input, SimpleChanges, ChangeDetectionStrategy } from "@angular/core";
import { NgxChartsModule } from "@swimlane/ngx-charts";

@Component({
  selector: 'app-chart-grades-average',
  standalone: true,
  imports: [
    NgxChartsModule
  ],
  template: `
  <ngx-charts-bar-vertical [tooltipDisabled]="false" [results]="studentsAverages" 
  [rotateXAxisTicks]="true" [gradient]="gradient"
  [xAxis]="showXAxis" [yAxis]="showYAxis" [legend]="showLegend" 
  [showXAxisLabel]="showXAxisLabel"
  [showYAxisLabel]="showYAxisLabel" [xAxisLabel]="xAxisLabel" 
  [yAxisLabel]="yAxisLabel" (select)="onSelect($event)">
</ngx-charts-bar-vertical>`,
  styleUrl: './chart-grades-avg-students.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class ChartGradesAverageStudetnsComponent implements OnChanges {

  @Input({ required: true }) studentsAverages: { name: string; value: number; }[] = [];

  @Input() xAxisLabel = '';
  @Input() yAxisLabel = '';

  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;

  constructor() {

  }
  ngOnChanges(changes: SimpleChanges): void {

  }

  onSelect(event: any) {

  }


}
