import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubjectsService {

  constructor() { 
    this.getSubjects();
  }

  http = inject(HttpClient);

  subjects = signal<{value:string,viewValue:string}[]>([]);

  getSubjects() {
    this.http.get<{value:string,viewValue:string}[]>(environment.subjectsAPI)
    .subscribe((data) => {
      this.subjects.set(data);
    });
  }
}
