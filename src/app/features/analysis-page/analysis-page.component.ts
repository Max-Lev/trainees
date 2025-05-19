
import { Component, computed, effect, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
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
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatSelectModule,
    MatButtonModule,
    MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule,
    DragDropModule,
    ChartGradesAverageStudetnsComponent,
    ChartStudentsAveragesComponent,
    ChartGradesAvgSubjectComponent
  ],
  templateUrl: './analysis-page.component.html',
  styleUrl: './analysis-page.component.scss'
})
export class AnalysisPageComponent {
  analysisStateService = inject(AnalysisStateService);

  availableIds = this.analysisStateService.availableIds;
  availableSubjects = this.analysisStateService.availableSubjects;

  constructor(){
    
  }
  
  drop(event: CdkDragDrop<any[]>) {
    this.analysisStateService.reorderCharts(event.previousIndex, event.currentIndex);
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
      this.analysisStateService.swapChart(chart, targetIndex);
    }
  }
}
