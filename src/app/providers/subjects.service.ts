import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { environment } from '../../environments/environment';
import { map, shareReplay, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubjectsService {

  http = inject(HttpClient);
  subjects$ = signal<{ value: string, viewValue: string }[]>([]);

  getSubjects(): Observable<{ value: string; viewValue: string; }[]> {
    if (this.subjects$().length > 0) {
      return of(this.subjects$());

    }
    return this.http.get<{ value: string, viewValue: string }[]>(environment.subjectsAPI).pipe(
      map((data) => data.map(subject => ({ value: subject.value, viewValue: subject.viewValue }))),
      tap((data) => this.subjects$.set(data)),
      shareReplay(1)
    );
  }
}
