
import { Component, computed, effect, inject } from '@angular/core';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { AnalysisStateService, ChartInfo } from './analysis-state.service';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChartGradesAverageStudetnsComponent } from '../../components/charts/chart-grades-avg-students/chart-grades-avg-students.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgFor, NgSwitch, NgSwitchCase } from '@angular/common';
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
    NgFor,
    MatSelectModule,
    MatFormFieldModule,
    MatSelectModule,
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
  // Inject the AnalysisStateService
  analysisStateService = inject(AnalysisStateService);
  averageUtilService = inject(AverageUtilService);

  // Get the available IDs and subjects from the AnalysisStateService
  availableIds = this.analysisStateService.availableIds;
  _selectedTraineeSignal = this.analysisStateService.getSelectedIds();

  availableSubjects = this.analysisStateService.availableSubjects;

  _selectedSubjects = this.analysisStateService.getSelectedSubjects();

  visibleCharts = this.analysisStateService.visibleCharts();
  hiddenCharts = this.analysisStateService.hiddenCharts();

  readonly studentsAveragesOverTime = computed(() =>
    this._selectedTraineeSignal().map(trainee => ({
      name: trainee.name ?? 'Unknown Trainee',
      series: (trainee.gradesOverTime ?? []).map(snapshot => ({
        name: snapshot?.date ?? 'Unknown Date',
        value: typeof snapshot?.average === 'number' && !isNaN(snapshot.average)
          ? snapshot.average
          : 0
      }))
    }))
  );

  readonly studentsAverages = computed(() =>
    this._selectedTraineeSignal().map(trainee => ({
      name: `${trainee.name?.trim() || 'Trainee'} #${trainee.id}`,
      value: this.safeAverage(this.averageUtilService.calculateAverage(trainee.grades!))
    }))
  );

  readonly subjectAverages = computed(() =>
    this._selectedSubjects().map(subject => ({
      name: subject,
      value: this.safeAverage(this.averageUtilService.calculateSubjectAverage(subject))
    }))
  );

  // Optional helper
  private safeAverage(avg: number): number {
    return isNaN(avg) || typeof avg !== 'number' ? 0 : avg;
  }


  constructor() {

  }

  idsChange($event: MatSelectChange) {
    const validIds = this.availableIds();
    const selected = ($event.value as Trainee[]).filter(id =>
      validIds.some(v => v.id === id.id)
    );
    this._selectedTraineeSignal.set(selected);
    this.analysisStateService.updateSelectedIds(selected);
  }

  subjectChange($event: MatSelectChange) {
    this._selectedSubjects.set($event.value as string[]);
    this.analysisStateService.updateSelectedSubjects($event.value)
  }

  /**
   * fix situation: deleting trainee and select selected options are empty on rout back
   */
  compareTrainees = (a: Trainee, b: Trainee) => a?.id === b?.id;


  drop(event: CdkDragDrop<ChartInfo[]>) {
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


}
