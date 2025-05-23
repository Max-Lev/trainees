import { Injectable, Injector, signal } from '@angular/core';
import { Trainee } from '../models/trainee.model';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AnalysisStateService } from '../features/analysis-page/analysis-state.service';

@Injectable({ providedIn: 'root' })
export class TraineeService {

  private http = inject(HttpClient);

  // Core data state
  trainees = signal<Trainee[]>([]);

  constructor() {
    // Initial data load
    this.loadTrainees();
  }

  private loadTrainees(): void {
    this.http.get<Trainee[]>(environment.traineesAPI).subscribe({
      next: data => this.trainees.set(data),
      error: err => console.error('Failed to load trainees', err)
    });
  }

  updateTrainee(updatedTrainee: Trainee) {
    this.trainees.update((traineesList) =>
      traineesList.map((existingTrainee) => {
        // Match by ID rather than by index for more reliable updates
        if (existingTrainee.id === updatedTrainee.id) {
          // Preserve _index to maintain consistency
          return { ...updatedTrainee, _index: existingTrainee._index };
        }
        return existingTrainee;
      })
    );
  }

  addTrainee(newTrainee: Partial<Trainee>) {
    if (!newTrainee) return;

    this.trainees.update((traineesList) => {
      // Make sure we have an _index property for the new trainee
      const traineeWithIndex = {
        ...newTrainee,
        _index: traineesList.length
      };
      return [...traineesList, traineeWithIndex as Trainee];
    });
  }

    removeTrainee(trainee: Trainee) {
      if (!trainee || !trainee.id) return;

      this.trainees.update(traineesList => {
        // Remove the trainee with the specified ID
        const filtered = traineesList.filter(t => t.id !== trainee.id);

        // Reindex the remaining trainees to maintain consistent _index values
        return filtered.map((t, idx) => ({...t, _index: idx}));
      });
    }


  // removeTrainee(trainee: Trainee | null = null) {
  //   const traineeToRemove = trainee;
  //   if (!traineeToRemove || !traineeToRemove.id) return;

  //   // Remove from trainee list
  //   this.removeTrainee(traineeToRemove);

  //   // Lazy load AnalysisStateService to avoid circular DI
  //   const injector = inject(Injector);
  //   const analysisStateService = injector.get(AnalysisStateService);

  //   // Remove from selected trainees if present
  //   const selected = analysisStateService.getSelectedIds();
  //   const updated = selected().filter(t => t.id !== traineeToRemove.id);
  //   analysisStateService.updateSelectedIds(updated);

  //   // Reset selected trainee if it's the one being removed
  //   // this.selectedTrainee.set({ action: SELECT_ACTIONS.initial, payload: null });
  // }


}
