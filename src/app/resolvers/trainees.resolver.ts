import { ResolveFn } from '@angular/router';
import { Trainee } from '../models/trainee.model';
import { inject } from '@angular/core';
import { TraineeService } from '../providers/trainee.service';

export const traineesResolver: ResolveFn<Trainee[]> = (route, state) => {

  const service = inject(TraineeService);
  const { trainees } = service;
  return (trainees().length > 0) ? trainees() : service.loadTrainees();

};
