
import { Component, inject } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { AnalysisStateService } from './analysis-state.service';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { ChartGradesAverageStudetnsComponent } from '../../components/charts/chart-grades-avg-students/chart-grades-avg-students.component';
import { ChartStudentsAveragesComponent } from '../../components/charts/chart-students-averages/chart-students-averages.component';
import { ChartGradesAvgSubjectComponent } from '../../components/charts/chart-grades-avg-subject/chart-grades-avg-subject.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgFor, NgSwitch, NgSwitchCase } from '@angular/common';

@Component({
  selector: 'app-analysis-page',
  standalone: true,
  imports: [
    NgSwitch,
    NgSwitchCase,
    NgFor,
    MatSelectModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    DragDropModule,
    ChartGradesAverageStudetnsComponent,
    ChartStudentsAveragesComponent,
    ChartGradesAvgSubjectComponent
  ],
  templateUrl: './analysis-page.component.html',
  styleUrl: './analysis-page.component.scss'
})
export class AnalysisPageComponent {
  // Inject the AnalysisStateService
  analysisStateService = inject(AnalysisStateService);

  // Get the available IDs and subjects from the AnalysisStateService
  availableIds = this.analysisStateService.availableIds;
  availableSubjects = this.analysisStateService.availableSubjects;

  constructor() {

  }

  // Function to reorder charts
  drop(event: CdkDragDrop<any[]>) {
    // Call the reorderCharts function from the AnalysisStateService
    this.analysisStateService.reorderCharts(event.previousIndex, event.currentIndex);
  }

  // Function to handle the end of a chart drag
  onHiddenChartDragEnded(event: any, chart: any) {
    // Check if dropped on charts container
    // This would need additional implementation with drop zones
    const element = event.source.element.nativeElement;
    const chartContainers = document.querySelectorAll('.chart-box');

    // Simple implementation - check if dragged over any chart container
    let droppedOnChart = false;
    let targetIndex = -1;

    // Loop through each chart container
    chartContainers.forEach((container, index) => {
      // Get the bounding rectangle of the chart container
      const rect = container.getBoundingClientRect();
      // Check if the dragged element is within the bounding rectangle of the chart container
      if (
        element.getBoundingClientRect().left > rect.left &&
        element.getBoundingClientRect().right < rect.right &&
        element.getBoundingClientRect().top > rect.top &&
        element.getBoundingClientRect().bottom < rect.bottom
      ) {
        // Set droppedOnChart to true and targetIndex to the index of the chart container
        droppedOnChart = true;
        targetIndex = index;
      }
    });

    // If dropped on a chart container and targetIndex is not -1, call the swapChart function from the AnalysisStateService
    if (droppedOnChart && targetIndex !== -1) {
      this.analysisStateService.swapChart(chart, targetIndex);
    }
  }
}
