import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

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
    this.http.get<{value:string,viewValue:string}[]>('http://localhost:4200/assets/mock-subjects.json')
    .subscribe((data) => {
      this.subjects.set(data);
    });
  }
}
