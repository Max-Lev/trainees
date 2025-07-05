import { effect, inject, Injectable, signal } from '@angular/core';
import { Trainee } from '../../models/trainee.model';
import { SELECT_ACTIONS } from '../../models/data.actions';
import { TraineeService } from '../../providers/trainee.service';

@Injectable({
  providedIn: 'root'
})
export class DataTableContainer {
  // Inject the TraineeService
  traineeService = inject(TraineeService);

  // Core data state
  trainees = this.traineeService.trainees;

  isAddBtnDisabled = signal<boolean>(false);

  // UI state
  selectedTrainee = signal<{ action: string, payload: Trainee | null }>({
    action: SELECT_ACTIONS.initial,
    payload: null
  });

  // Filter and pagination state - persistent across navigation
  filterValue = signal<string>('');
  pageState = signal<{ pageIndex: number, pageSize: number }>({ pageIndex: 0, pageSize: 10 });

  // Form values for add/update operations
  updatedTraineeValue = signal<Partial<Trainee> | null>(null);
  newTraineeValue = signal<Partial<Trainee> | null>(null);

  constructor() {
    
  }

  // Utility function to toggle selection
  toggleSelection(value: { action: string; payload: Trainee | null; index?: number }) {
    const selected = this.selectedTrainee();

    // If clicking the same row, toggle selection off
    if (selected.payload?._index === value.payload?._index) {
      this.selectedTrainee.set({ action: SELECT_ACTIONS.initial, payload: null });
    } else {
      // Otherwise, select the trainee
      this.selectedTrainee.set({ action: SELECT_ACTIONS.select_row, payload: value.payload });
    }
  }

  // Update an existing trainee
  updateTrainee(updated: Partial<Trainee>) {
    
    if (!updated || !this.selectedTrainee().payload) return;

    updated = {
      ...updated,
      grade: this.setSelectedGrade(updated as Trainee, updated.subject || ''),
    } as Trainee; // Ensure value is of type Trainee
    
    
    const selectedTrainee = this.selectedTrainee().payload;
    const updatedTrainee = { ...selectedTrainee, ...updated };
    
    // Update the trainee in the TraineeService
    this.traineeService.updateTrainee(updatedTrainee as Trainee);
    // Update the selected trainee in the UI
    this.selectedTrainee.set({ action: SELECT_ACTIONS.select_row, payload: updatedTrainee as Trainee });
    // Reset the updatedTraineeValue
    this.updatedTraineeValue.set(null);
  }

  // Add a new trainee
  addNewTrainee() {
    
    const newTrainee = this.newTraineeValue();
    if (!newTrainee) return;

    // Generate a unique ID (in a real app this might come from the backend)
    const maxId = Math.max(...this.trainees().map(t => t.id || 0), 0);
    const traineeWithId: Partial<Trainee> = {
      ...newTrainee,
      id: (!newTrainee.id) ? (maxId + 1) : newTrainee.id,
      grade: this.setSelectedGrade(newTrainee as Trainee, newTrainee.subject || ''),
      dateJoined: newTrainee.dateJoined || new Date().toISOString().slice(0, 10),
      _index: this.trainees().length
    };
    
    // Add the new trainee to the TraineeService
    this.traineeService.addTrainee(traineeWithId);

    // Select the newly added trainee
    this.selectedTrainee.set({
      action: SELECT_ACTIONS.select_row,
      payload: traineeWithId as Trainee
    });

    // Reset the newTraineeValue
    this.newTraineeValue.set(null);
  }

  private setSelectedGrade(trainee: Trainee, subject: string) {
    return (trainee.grades && trainee.subject ? trainee.grades[subject] : undefined)
  }

  // Remove a trainee
  removeTrainee(trainee: Trainee | null = null) {
    const traineeToRemove = trainee || this.selectedTrainee().payload;
    if (!traineeToRemove || !traineeToRemove.id) return;

    // Remove the trainee from the TraineeService
    this.traineeService.removeTrainee(traineeToRemove);
    // Reset the selected trainee
    this.selectedTrainee.set({ action: SELECT_ACTIONS.initial, payload: null });
  }

  // Open the panel for adding a new trainee
  openAddPanel() {
    this.selectedTrainee.set({ action: SELECT_ACTIONS.open_panel, payload: null });
    this.newTraineeValue.set({});
  }

  // Update filter state
  setFilter(value: string) {
    this.filterValue.set(value);
  }

  // Update pagination state
  setPageState(state: { pageIndex: number, pageSize: number }) {
    this.pageState.set(state);
  }
}

