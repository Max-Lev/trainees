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
  private readonly traineeService = inject(TraineeService);
  private readonly subjectsService = inject(SubjectsService);

  // Private signals for selected state
  private readonly _selectedTrainees = signal<Trainee[]>([]);
  private readonly _selectedSubjects = signal<string[]>([]);

  // Chart configurations
  readonly visibleCharts = signal<ChartInfo[]>([
    { id: 'chart1', title: 'Chart 1: Student Time Averages' },
    { id: 'chart2', title: 'Chart 2: Subject Averages' }
  ]);

  readonly hiddenCharts = signal<ChartInfo[]>([
    { id: 'chart3', title: 'Chart 3: Student Averages' }
  ]);

  // Computed properties for available data
  readonly availableTrainees = computed(() => [...this.traineeService.trainees()]);
  readonly availableSubjects = computed(() => [...this.subjectsService.subjects()]);

  // Computed properties for selected data
  readonly selectedTrainees = computed(() => this._selectedTrainees());
  readonly selectedSubjects = computed(() => this._selectedSubjects());

  constructor() {
    this.watchSelectedTrainees();
  }

  // Selection management methods
  updateSelectedTrainees(trainees: Trainee[]): void {
    this._selectedTrainees.set(trainees);
  }

  getSelectedTrainees(): WritableSignal<Trainee[]> {
    return this._selectedTrainees;
  }

  updateSelectedSubjects(subjects: string[]): void {
    this._selectedSubjects.set(subjects);
  }

  getSelectedSubjects(): WritableSignal<string[]> {
    return this._selectedSubjects;
  }

  // Keep selected trainees in sync with available trainees
  private watchSelectedTrainees(): void {
    effect(() => {
      const availableTrainees = this.availableTrainees();
      const selectedTrainees = this._selectedTrainees();

      const validSelectedTrainees = selectedTrainees.filter(trainee =>
        // availableTrainees.some(t => t.id === trainee.id)
        // availableTrainees.find(t => t._index === trainee._index && t.id === trainee.id)
        availableTrainees.find(t => t.id === trainee.id)
      );

      if (validSelectedTrainees.length !== selectedTrainees.length) {
        this._selectedTrainees.set(validSelectedTrainees);
      }
    }, { allowSignalWrites: true });
  }
}