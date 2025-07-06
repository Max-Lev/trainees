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
  traineeService = inject(TraineeService);
  subjectsService = inject(SubjectsService);

  private _availableSubjects = computed(() => this.subjectsService.subjects());
  public availableSubjects = computed(() => this._availableSubjects());
  public selectedSubjects = computed(() => this._selectedSubjects());
  // Chart configurations
  visibleCharts = signal<ChartInfo[]>([
    { id: 'chart1', title: 'Chart 1: Student Time Averages' },
    { id: 'chart2', title: 'Chart 2: Subject Averages' }
  ]);

  hiddenCharts = signal<ChartInfo[]>([
    { id: 'chart3', title: 'Chart 3: Student Averages' }
  ]);

  constructor() {
    this.watchSelectedIds();
  }

  // Available data
  private _availableIds = computed(() => [...this.traineeService.trainees()]);

  // Selected filters
  private _selectedTraineesIds = signal<Trainee[]>([]);
  private _selectedSubjects = signal<string[]>([]);

  // Computed properties
  public trainees = computed(() => {
    return this._availableIds();
  });

  public selectedIds = computed(() => {
    return this._selectedTraineesIds();
  });

  // Update methods
  updateSelectedIds(trainees: Trainee[]) {
    this._selectedTraineesIds.set(trainees);
  }

  getSelectedIds() {
    return this._selectedTraineesIds;
  }


  watchSelectedIds() {
    effect(() => {
      const availableIds = this._availableIds();
      const selected = this._selectedTraineesIds();

      const filtered = selected.filter(trainee =>
        availableIds.some(t => t.id === trainee.id)
      );

      if (filtered.length !== selected.length) {
        this._selectedTraineesIds.set(filtered);
      }
    }, { allowSignalWrites: true });
  }

  // This function updates the selected subjects by setting the subjects array to the _selectedSubjects set
  updateSelectedSubjects(subjects: string[]) {
    this._selectedSubjects.set(subjects);
  }

  getSelectedSubjects(): WritableSignal<string[]> {
    return this._selectedSubjects;
  }


}