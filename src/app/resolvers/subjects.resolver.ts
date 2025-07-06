import { inject, WritableSignal } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { SubjectsService } from '../providers/subjects.service';
import { Observable } from 'rxjs';

export const subjectsResolver: ResolveFn<Observable<{ value: string; viewValue: string; }[]> > = () => {
    return inject(SubjectsService).getSubjects();
  };
