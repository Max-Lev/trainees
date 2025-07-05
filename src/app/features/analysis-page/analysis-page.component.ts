
import { Component, computed, effect, inject, signal, WritableSignal } from '@angular/core';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { AnalysisStateService } from './analysis-state.service';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
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
  _studentsAverages: { name: string; value: number; }[] = [];

  availableSubjects = this.analysisStateService.availableSubjects;

  _selectedSubjects = this.analysisStateService.getSelectedSubjects();
  _subjectAverages: { name: string; value: number; }[] = [];

  visibleCharts = this.analysisStateService.visibleCharts();
  hiddenCharts = this.analysisStateService.hiddenCharts();
  // _studentsAveragesOverTime: { name: string; series: { name: string; value: number }[] }[] = [];

  readonly studentsAveragesOverTime = computed(() => {
    return this._selectedTraineeSignal().map(trainee => ({
      name: trainee.name ?? 'Unknown Trainee',
      series: trainee.gradesOverTime?.map(snapshot => ({
        name: snapshot.date,
        value: snapshot.average || 0
      })) || []
    }));
  });
  


  constructor() {

    effect(() => {
      const _studentsAverages = this._selectedTraineeSignal().map((trainee, index) => ({
        name: `${trainee.name} #${trainee.id}`,
        value: this.averageUtilService.calculateAverage(trainee.grades!)
      }));
      this._studentsAverages = _studentsAverages;
    });

    effect(() => {
      const _subjectAverages = this._selectedSubjects().map((subject, index) => ({
        name: `${subject}`,
        value: this.averageUtilService.calculateSubjectAverage(subject)
      }));
      this._subjectAverages = _subjectAverages;
    });

    // effect(() => {
    //   const studentsAveragesOverTime = this._selectedTraineeSignal().map(trainee => ({
    //     name: trainee.name ?? 'Unknown Trainee',
    //     series: trainee.gradesOverTime?.map(snapshot => ({
    //       name: snapshot.date,
    //       value: snapshot.average || 0
    //     })) || []
    //   }));
    //   this._studentsAveragesOverTime = studentsAveragesOverTime;
    //   console.log('_studentsAveragesOverTime ',this._studentsAveragesOverTime);
    // });
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

  /**
  * Handles drag-and-drop functionality for charts.
  * Allows swapping between visible charts and hidden charts.
  */
 drop(event: CdkDragDrop<any[]>) {
   if (event.previousContainer === event.container) {
     // Reorder within the same container
     moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
   } else {
     // Transfer between containers
     transferArrayItem(
       event.previousContainer.data,
       event.container.data,
       event.previousIndex,
       event.currentIndex
     );
   }
 }

}
