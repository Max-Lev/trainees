// analysis-state.service.ts
import { Injectable, signal, computed, inject, effect, WritableSignal } from '@angular/core';
import { TraineeService } from '../../providers/trainee.service';
import { SubjectsService } from '../../providers/subjects.service';
import { Trainee } from '../../models/trainee.model';

export interface ChartInfo {
  id: string;
  title: string;
  visible?: boolean;
  position?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalysisStateService {

  // Injecting services
  analysisTraineeService = inject(TraineeService);
  traineeService = inject(TraineeService);

  subjectsService = inject(SubjectsService);
  private _availableSubjects = computed(() => this.subjectsService.subjects());
  public availableSubjects = computed(() => this._availableSubjects());
  public selectedSubjects = computed(() => this._selectedSubjects());
  // Chart configurations
  visibleCharts = signal<ChartInfo[]>([
    { id: 'chart1', title: 'Chart 1: Student Time Series' },
    { id: 'chart2', title: 'Chart 2: Subject Averages' }
  ]);
  
  hiddenCharts = signal<ChartInfo[]>([
    { id: 'chart3', title: 'Chart 3: Student Averages' }
  ]);

  constructor() {
    this.watchSelectedIds();
  }

  // Available data
  private _availableIds = computed(() => {
    // return this.analysisTraineeService.trainees().map(trainee => {
    return this.traineeService.trainees().map(trainee => {
      return trainee;
    });
  });

  // Selected filters
  private _selectedIds = signal<Trainee[]>([]);
  private _selectedSubjects = signal<string[]>([]);

  // Computed properties
  public availableIds = computed(() => {
    return this._availableIds();
  });

  public selectedIds = computed(() => {
    return this._selectedIds();
  });

  // Update methods
  updateSelectedIds(trainees: Trainee[]) {
    this._selectedIds.set(trainees);
  }

  // :WritableSignal<Trainee[]>
  getSelectedIds() {
    return this._selectedIds;
  }

  watchSelectedIds() {
    effect(() => {
      const availableIds = this._availableIds();
      const selected = this._selectedIds();

      const filtered = selected.filter(trainee =>
        availableIds.some(t => t.id === trainee.id)
      );

      if (filtered.length !== selected.length) {
        this._selectedIds.set(filtered);
      }
      
    }, { allowSignalWrites: true });
  }

  // This function updates the selected subjects by setting the subjects array to the _selectedSubjects set
  updateSelectedSubjects(subjects: string[]) {
    // Set the _selectedSubjects set to the subjects array
    this._selectedSubjects.set(subjects);
  }

  getSelectedSubjects(): WritableSignal<string[]> {
    return this._selectedSubjects;
  }

 
}