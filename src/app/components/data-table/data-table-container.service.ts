import { inject, Injectable, signal } from '@angular/core';
import { Trainee } from '../../models/trainee.model';
import { SELECT_ACTIONS } from '../../models/data.actions';
import { TraineeService } from '../../providers/trainee.service';

@Injectable({
  providedIn: 'root'
})
export class DataTableContainer {

  constructor() { }

  traineeService = inject(TraineeService);

  trainees = signal<Trainee[]>([]);

  filteredTrainees = signal<Trainee[]>([]);

  selectedTrainee = signal<{ action: string, payload: Trainee | null }>({ action: SELECT_ACTIONS.initial, payload: null });

  filterValue = signal<string | null>('');

  pageState = signal<number | null>(null);

  // This function toggles the selection of a trainee
  toggleSelection(value: { action: string; payload: Trainee; index?: number }) {
    // Get the currently selected trainee
    const selected = this.selectedTrainee();
    // If the selected trainee is the same as the one being toggled, deselect it
    console.log(selected.payload?.id, value.payload.id)
    if (selected.payload?.id === value.payload.id) {

      if (selected) {
        debugger
        this.selectedTrainee.set({ action: SELECT_ACTIONS.initial, payload: null })
      } else {
        debugger;
        this.selectedTrainee.set({ action: SELECT_ACTIONS.select_row, payload: value.payload });
      }

      // (selected) ? this.selectedTrainee.set({ action: SELECT_ACTIONS.initial, payload: null }) :
      //   // Otherwise, select the trainee
      //   this.selectedTrainee.set({ action: SELECT_ACTIONS.select_row, payload: value.payload });
    }
    else {

      // Otherwise, select the trainee
      this.selectedTrainee.set({ action: SELECT_ACTIONS.select_row, payload: value.payload });
    }
    // Log the currently selected trainee
    console.log(this.selectedTrainee());
  }

  updatedTraineeValue = signal<Partial<Trainee> | null>(null);
  newTraineeValue = signal<Partial<Trainee> | null>(null);

  // updateTrainee(updated: Trainee) {
  updateTrainee(updated: any) {
    const selected = this.selectedTrainee().payload;
    const updatedTrainee = { ...selected, ...updated };
    this.traineeService.updateTrainee(updatedTrainee);
    this.selectedTrainee.set({ action: SELECT_ACTIONS.select_row, payload: updatedTrainee });
  }

  addNewTrainee(newTrainee: Partial<Trainee> | null) {
    this.traineeService.addTrainee(newTrainee);
  }

  // Function to update a trainee
  /*updateTrainee(updated: Trainee) {

    // Get all trainees
    const allTrainees = this.trainees();

    // Get the ID of the selected trainee
    const selectedTraineeID = this.selectedTrainee().payload?.id;

    // Find the trainee to update
    const findToUpdate = allTrainees.find(trainee => trainee.id === selectedTraineeID);

    // Log the trainee to update
    console.log(findToUpdate);
    
    // If the ID of the updated trainee is not the same as the ID of the trainee to update
    if(updated.id!==findToUpdate?.id){
      // Set the updated trainee
      this.selectedTrainee.set({ action: SELECT_ACTIONS.update_existing_trainee, payload: updated });
    }

    // Update the trainee list
    this.trainees.update((traineesList: Trainee[]) => traineesList.map(trainee => trainee.id === findToUpdate?.id ? { ...trainee, ...updated } : trainee));

    this.traineeService.trainees.set(this.trainees());

    // Log the updated trainee list
    console.log(this.trainees());

  }*/



}
