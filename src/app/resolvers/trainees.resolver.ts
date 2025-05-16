import { ResolveFn } from '@angular/router';
import { Trainee } from '../models/trainee.model';
import { effect, inject } from '@angular/core';
import { TraineeService } from '../providers/trainee.service';

export const traineesResolver: ResolveFn<Trainee[]> = (route, state) => {
  
  const service = inject(TraineeService);
  return new Promise<Trainee[]>((resolve) => {
    const stop = effect(() => {
      const data = service.trainees$();
      if (data.length > 0) {
        resolve(data);
        stop.destroy();
      }
    });
  });


};
