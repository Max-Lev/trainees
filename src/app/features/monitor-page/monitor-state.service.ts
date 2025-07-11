import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Trainee } from '../../models/trainee.model';
import { TraineeService } from '../../providers/trainee.service';
import { AverageUtilService } from '../../providers/average-util.service';


@Injectable({ providedIn: 'root' })
export class MonitorStateService {

  // Inject the TraineeService
  traineeService = inject(TraineeService);
  averageUtilService = inject(AverageUtilService);

  // Get all trainees from the TraineeService
  trainees = this.traineeService.trainees;

  // Create a signal to store the selected trainee IDs
  selectedTrainee = signal<Trainee[]>([]);
  // Create a signal to store the name filter
  nameFilter = signal('');
  showPassed = signal(true);
  showFailed = signal(true);
  pageState = signal<{ pageIndex: number, pageSize: number }>({ pageIndex: 0, pageSize: 10 });

  constructor() {
    this.syncTraineesSelected();
  }

  // Calculate the average grade of a trainee
  calculateAverage(grades: Record<string, number>): number {
    return this.averageUtilService.calculateAverage(grades!);
  }

  // Count the number of exams a trainee has taken
  countExams(grades: Record<string, number>): number {
    return Object.values(grades ?? {}).filter(g => typeof g === 'number').length;
  }

  // Create a computed value to filter the trainees based on the selected IDs, name filter, and pass/fail status
  readonly filteredTrainees = computed(() => {
    return this.trainees().filter((trainee: Trainee) => {
      const avg = this.calculateAverage(trainee.grades!);

      const matchesId = !this.selectedTrainee().length || this.selectedTrainee().some(t => t._index === trainee._index);

      const matchesName = trainee.name?.toLowerCase().includes(this.nameFilter().toLowerCase()) ?? true;

      const isPassed = avg >= 65;

      const matchesState = (isPassed && this.showPassed()) || (!isPassed && this.showFailed());
      return matchesId && matchesName && matchesState;
    });
  });

  setPageState(state: { pageIndex: number, pageSize: number }) {
    this.pageState.set(state);
  }


  private syncTraineesSelected() {
    effect(() => {
      const currentSelection = this.selectedTrainee();
      const currentTrainees = this.trainees();

      const updatedSelection = currentSelection.map(_selected => currentTrainees.find(t => t._index === _selected._index))
        .filter((trainee): trainee is Trainee => !!trainee);

      // Only update if the references changed (avoid infinite loops)
      const hasChanged = updatedSelection.some((t, i) => t !== currentSelection[i]);
      if (hasChanged) {
        this.selectedTrainee.set(updatedSelection);
      }
    }, { allowSignalWrites: true });
  }

}
