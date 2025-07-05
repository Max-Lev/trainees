import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxChartsModule } from "@swimlane/ngx-charts";

@Component({
  selector: 'app-chart-students-averages',
  standalone: true,
  imports: [NgxChartsModule],
  template: `
    <ngx-charts-line-chart
      [view]="view"
      [results]="chartData"
      [xAxis]="false"
      [yAxis]="true"
      [legend]="true"
      [showXAxisLabel]="true"
      [showYAxisLabel]="false"
      [xAxisLabel]="'Date'"
      [yAxisLabel]="'Average Grade'"
      [autoScale]="true">
    </ngx-charts-line-chart>
  `,
  styleUrls: ['./chart-students-averages.component.scss']
})
export class ChartStudentsAveragesComponent implements OnChanges {
  // ✅ CHANGED: internal memoized input to avoid unnecessary redraw
  @Input() studentsAveragesOverTime: { name: string; series: { name: string; value: number }[] }[] = [];

  chartData: { name: string; series: { name: string; value: number }[] }[] = [];

  view: [number, number] = [700, 400];

  // ✅ CHANGED: deep input processing inside ngOnChanges
  ngOnChanges(changes: SimpleChanges) {
    if (changes['studentsAveragesOverTime']) {
      // shallow copy to avoid full redraw unless data changes
      this.chartData = [...this.studentsAveragesOverTime];
    }
  }
}
