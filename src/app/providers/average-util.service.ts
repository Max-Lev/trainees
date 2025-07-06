import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Trainee } from '../models/trainee.model';
import { TraineeService } from './trainee.service';

@Injectable({
  providedIn: 'root'
})
export class AverageUtilService {
  traineeService = inject(TraineeService);
  // Get all trainees from the TraineeService
  allTrainees = this.traineeService.trainees;
  // Create a signal to store the selected trainee IDs
  selectedIds = signal<number[]>([]);
  showPassed = signal(true);
  showFailed = signal(true);
  nameFilter = signal('');
  constructor() {

  }

  // Calculate the average grade of a trainee
  calculateAverage(grades: Record<string, number>): number {
    const values = Object.values(grades ?? {}).filter(g => typeof g === 'number');
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    return Math.round((sum / values.length) * 100) / 100; // rounded to 2 decimals
  }

  calculateSubjectAverage(subject: string): number {
    const values = this.allTrainees().map(trainee => trainee.grades?.[subject] ?? 0).filter(g => typeof g === 'number');
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const avg = Math.round((sum / values.length) * 100) / 100; // rounded to 2 decimals
    return avg;

  }

  // Create a computed value to filter the trainees based on the selected IDs, name filter, and pass/fail status
  readonly filteredTrainees = computed(() => {
    return this.allTrainees().filter((trainee: Trainee) => {
      const avg = this.calculateAverage(trainee.grades!);
      const matchesId = !this.selectedIds().length || this.selectedIds().includes(trainee.id);
      const matchesName = trainee.name?.toLowerCase().includes(this.nameFilter().toLowerCase()) ?? true;
      const isPassed = avg >= 65;
      const matchesState = (isPassed && this.showPassed()) || (!isPassed && this.showFailed());
      const found = matchesId && matchesName && matchesState;
      return found;
    });
  });
}
