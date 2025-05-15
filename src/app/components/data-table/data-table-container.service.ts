import { Injectable, signal } from '@angular/core';
import { Trainee } from '../../models/trainee.model';

@Injectable({
  providedIn: 'root'
})
export class DataTableContainerService {

  constructor() { }

  selectedTrainee = signal<Trainee | null>(null);
  toggleSelection(row: Trainee) {
    const selected: Trainee | null = this.selectedTrainee();
    if (selected?.id === row.id) {
      (selected) ? this.selectedTrainee.set(null) : this.selectedTrainee.set(row);
    } else {
      this.selectedTrainee.set(row);
    }
  }

  filterValue = signal<string | null>('');

  pageState = signal<number | null>(null);

}
