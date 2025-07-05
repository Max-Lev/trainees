import { Injectable, Injector, signal } from '@angular/core';
import { Trainee } from '../models/trainee.model';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { RandomGradesUtilService } from './random-grades-util.service';

@Injectable({ providedIn: 'root' })
export class TraineeService {

  private http = inject(HttpClient);
  private randomGradesUtilService = inject(RandomGradesUtilService);

  // Core data state
  trainees = signal<Trainee[]>([]);

  constructor() {
    // Initial data load
    this.loadTrainees();
  }

  private loadTrainees(): void {
    this.http.get<Trainee[]>(environment.traineesAPI).pipe(
      map(data => data.map((trainee: Trainee, index) => ({ ...trainee, _index: index }))),
      map(data => {
       data =  data.map((trainee) => {
          const gradesOverTime = this.randomGradesUtilService.generateRandomGradesOverTime(trainee, "2024-01-01", "2025-12-31", 30); // Generate grades every 30 days
          trainee = { ...trainee, gradesOverTime: gradesOverTime };
          return trainee;
        })
        return data;
      })
    )
    .subscribe({
      next: data => this.trainees.set(data),
      error: err => console.error('Failed to load trainees', err)
    });
  }

  updateTrainee(updatedTrainee: Trainee) {
    
    this.trainees.update((traineesList) =>
      traineesList.map((existingTrainee) => {
        // Match by ID rather than by index for more reliable updates
        // if (existingTrainee.id === updatedTrainee.id) {
        if (existingTrainee._index === updatedTrainee._index) {
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
      const _newTrainee = {
        ...newTrainee,
        _index: traineesList.length
      };
      console.log('Adding trainee:', _newTrainee);
      return [...traineesList, _newTrainee as Trainee];
    });
    console.log(this.trainees());
  }

  removeTrainee(trainee: Trainee) {
    if (!trainee || !trainee.id) return;

    this.trainees.update(traineesList => {
      // Remove the trainee with the specified ID
      const filtered = traineesList.filter(t => t.id !== trainee.id);

      // Reindex the remaining trainees to maintain consistent _index values
      return filtered.map((trainee, idx) => ({ ...trainee, _index: idx }));
    });
  }

}


 
