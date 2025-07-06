import { Component, computed, effect, inject } from '@angular/core';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { AnalysisStateService, ChartInfo } from './analysis-state.service';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChartGradesAverageStudetnsComponent } from '../../components/charts/chart-grades-avg-students/chart-grades-avg-students.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgSwitch, NgSwitchCase } from '@angular/common';
import { Trainee } from '../../models/trainee.model';
import { AverageUtilService } from '../../providers/average-util.service';
import { ChartSubjectsAvgComponent } from '../../components/charts/chart-subjects-avg/chart-subjects-avg.component';
import { ChartStudentsAveragesComponent } from '../../components/charts/chart-students-averages/chart-students-averages.component';

@Component({
  selector: 'app-analysis-page',
  standalone: true,
  imports: [
    NgSwitch,
    NgSwitchCase,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    DragDropModule,
    ChartGradesAverageStudetnsComponent,
    ChartSubjectsAvgComponent,
    ChartStudentsAveragesComponent
  ],
  templateUrl: './analysis-page.component.html',
  styleUrl: './analysis-page.component.scss'
})
export class AnalysisPageComponent {
  // Inject services
  private readonly analysisStateService = inject(AnalysisStateService);
  private readonly averageUtilService = inject(AverageUtilService);

  // Public properties for template access
  readonly availableTrainees = this.analysisStateService.availableTrainees;
  readonly selectedTrainees = this.analysisStateService.getSelectedTrainees();
  readonly availableSubjects = this.analysisStateService.availableSubjects;
  readonly selectedSubjects = this.analysisStateService.getSelectedSubjects();
  readonly visibleCharts = this.analysisStateService.visibleCharts();
  readonly hiddenCharts = this.analysisStateService.hiddenCharts();

  // Computed data for charts
  readonly studentsAveragesOverTime = computed(() =>
    this.selectedTrainees().map(trainee => ({
      name: trainee.name ?? 'Unknown Trainee',
      series: (trainee.gradesOverTime ?? []).map(snapshot => ({
        name: snapshot?.date ?? 'Unknown Date',
        value: typeof snapshot?.average === 'number' && !isNaN(snapshot.average) ? snapshot.average : 0
      }))
    }))
  );

  readonly studentsAverages = computed(() => {
    const allTrainees = this.availableTrainees();
    return this.selectedTrainees().map(trainee => {
      const currentTrainee = allTrainees.find(t => t._index === trainee._index) || trainee;
      return {
        name: `${currentTrainee.name?.trim() || 'Trainee'} #${currentTrainee.id}`,
        value: this.safeAverage(this.averageUtilService.calculateAverage(currentTrainee.grades!))
      };
    });
  });

  readonly subjectAverages = computed(() =>
    this.selectedSubjects().map(subject => ({
      name: subject,
      value: this.safeAverage(this.averageUtilService.calculateSubjectAverage(subject))
    }))
  );

  constructor() {
    effect(() => {
      console.log(this.availableTrainees())
    })
  }

  // Event handlers
  onTraineesSelectionChange(event: MatSelectChange): void {
    const validTrainees = this.availableTrainees();
    const selectedTrainees = (event.value as Trainee[]).filter(trainee => validTrainees.some(v => v._index === trainee._index));
    this.selectedTrainees.set(selectedTrainees);
    this.analysisStateService.updateSelectedTrainees(selectedTrainees);
  }

  onSubjectsSelectionChange(event: MatSelectChange): void {
    const selectedSubjects = event.value as string[];
    this.selectedSubjects.set(selectedSubjects);
    this.analysisStateService.updateSelectedSubjects(selectedSubjects);
  }

  onChartDrop(event: CdkDragDrop<ChartInfo[]>): void {
    const prevList = event.previousContainer.data;
    const currList = event.container.data;

    // Reordering within the same list (only allowed in visibleCharts)
    if (prevList === currList && currList === this.visibleCharts) {
      moveItemInArray(currList, event.previousIndex, event.currentIndex);
      return;
    }

    const draggedChart = prevList[event.previousIndex];

    // Dragging from hidden -> visible: Swap dragged hidden chart with the one at drop position
    if (prevList === this.hiddenCharts && currList === this.visibleCharts) {
      const replacedChart = currList[event.currentIndex];

      if (!replacedChart) return;

      // Replace visible with hidden
      currList.splice(event.currentIndex, 1, draggedChart);
      // Replace hidden with previously visible
      prevList.splice(event.previousIndex, 1, replacedChart);
      return;
    }

    // Dragging from visible -> hidden: Always store dragged chart into hidden, and swap with hidden chart
    if (prevList === this.visibleCharts && currList === this.hiddenCharts) {
      const replacedChart = currList[event.currentIndex];

      // Replace hidden with dragged
      currList.splice(event.currentIndex, 1, draggedChart);
      // Replace visible with hidden chart
      prevList.splice(event.previousIndex, 1, replacedChart);
      return;
    }
  }

  // Utility methods
  compareTrainees = (a: Trainee, b: Trainee): boolean => a?._index === b?._index;

  private safeAverage(avg: number): number {
    return isNaN(avg) || typeof avg !== 'number' ? 0 : avg;
  }
}