import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Trainee } from '../../models/trainee.model';
import { TraineeService } from '../../providers/trainee.service';


@Injectable({ providedIn: 'root' })
export class MonitorStateService {

  traineeService = inject(TraineeService);

  allTrainees = this.traineeService.trainees;

  selectedIds = signal<number[]>([]);
  nameFilter = signal('');
  showPassed = signal(true);
  showFailed = signal(true);
  pageState = signal<{ pageIndex: number, pageSize: number }>({ pageIndex: 0, pageSize: 10 });

  constructor() {
 
  }

  calculateAverage(grades: Record<string, number>): number {
    const values = Object.values(grades ?? {}).filter(g => typeof g === 'number');
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    return Math.round((sum / values.length) * 100) / 100; // rounded to 2 decimals
  }

  countExams(grades: Record<string, number>): number {
    return Object.values(grades ?? {}).filter(g => typeof g === 'number').length;
  }

  readonly filteredTrainees = computed(() => {
    return this.allTrainees().filter((trainee: Trainee) => {
      const avg = this.calculateAverage(trainee.grades!);
      const matchesId = !this.selectedIds().length || this.selectedIds().includes(trainee.id);
      const matchesName = trainee.name?.toLowerCase().includes(this.nameFilter().toLowerCase()) ?? true;
      const isPassed = avg >= 65;
      const matchesState = (isPassed && this.showPassed()) || (!isPassed && this.showFailed());  
      return matchesId && matchesName && matchesState;
    });
  });

  setPageState(state: { pageIndex: number, pageSize: number }) {
    this.pageState.set(state);
  }
}
