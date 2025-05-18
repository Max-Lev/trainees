import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { AnalysisStateService } from './analysis-state.service';
// import { ChartComponent } from '../../components/chart/chart.component';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { ChartGradesAverageStudetnsComponent } from '../../components/charts/chart-grades-avg-students/chart-grades-avg-students.component';
import { ChartStudentsAveragesComponent } from '../../components/charts/chart-students-averages/chart-students-averages.component';
import { ChartGradesAvgSubjectComponent } from '../../components/charts/chart-grades-avg-subject/chart-grades-avg-subject.component';

@Component({
  selector: 'app-analysis-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatSelectModule,
    MatButtonModule,

    // CdkDrag,
    // CdkDropList,
    DragDropModule,
    ChartGradesAverageStudetnsComponent,
    ChartStudentsAveragesComponent,
    ChartGradesAvgSubjectComponent
    // ChartComponent,
    // Chart1Component,
    // Chart2Component,
    // Chart3Component
  ],
  templateUrl: './analysis-page.component.html',
  styleUrl: './analysis-page.component.scss'
})
export class AnalysisPageComponent {
  stateService = inject(AnalysisStateService);
  
  drop(event: CdkDragDrop<any[]>) {
    this.stateService.reorderCharts(event.previousIndex, event.currentIndex);
  }
  
  onHiddenChartDragEnded(event: any, chart: any) {
    // Check if dropped on charts container
    // This would need additional implementation with drop zones
    const element = event.source.element.nativeElement;
    const chartContainers = document.querySelectorAll('.chart-box');
    
    // Simple implementation - check if dragged over any chart container
    let droppedOnChart = false;
    let targetIndex = -1;
    
    chartContainers.forEach((container, index) => {
      const rect = container.getBoundingClientRect();
      if (
        element.getBoundingClientRect().left > rect.left &&
        element.getBoundingClientRect().right < rect.right &&
        element.getBoundingClientRect().top > rect.top &&
        element.getBoundingClientRect().bottom < rect.bottom
      ) {
        droppedOnChart = true;
        targetIndex = index;
      }
    });
    
    if (droppedOnChart && targetIndex !== -1) {
      this.stateService.swapChart(chart, targetIndex);
    }
  }
}
