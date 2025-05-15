import { Injectable, signal } from '@angular/core';
import { Trainee } from '../../models/trainee.model';

@Injectable({
  providedIn: 'root'
})
export class DataTableContainerService {

  constructor() { }

  selectedTrainee = signal<Trainee | null>(null);

  toggleSelection(row: Trainee) {
    const isSelected = this.selectedTrainee();
    (isSelected) ? this.selectedTrainee.set(null) : this.selectedTrainee.set(row);
    console.log(this.selectedTrainee());
  }
}
