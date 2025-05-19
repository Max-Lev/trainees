import { effect, inject, Injectable, signal } from '@angular/core';
import { Trainee } from '../../models/trainee.model';
import { SELECT_ACTIONS } from '../../models/data.actions';
import { TraineeService } from '../../providers/trainee.service';

@Injectable({
  providedIn: 'root'
})
export class DataTableContainer {
  traineeService = inject(TraineeService);

  // Core data state
  trainees = signal<Trainee[]>([]);

  constructor() {
    
  }

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
    const selectedTrainee = this.selectedTrainee().payload;
    const updatedTrainee = { ...selectedTrainee, ...updated };

    this.traineeService.updateTrainee(updatedTrainee as any);
    this.selectedTrainee.set({ action: SELECT_ACTIONS.select_row, payload: updatedTrainee as any });
    this.updatedTraineeValue.set(null);
  }

  // Add a new trainee
  addNewTrainee() {
    const newTrainee = this.newTraineeValue();
    if (!newTrainee) return;

    // Generate a unique ID (in a real app this might come from the backend)
    const maxId = Math.max(...this.trainees().map(t => t.id || 0), 0);
    const traineeWithId = {
      ...newTrainee,
      id: (!newTrainee.id) ? (maxId + 1) : newTrainee.id,
      _index: this.trainees().length
    };

    this.traineeService.addTrainee(traineeWithId);

    // Select the newly added trainee
    this.selectedTrainee.set({
      action: SELECT_ACTIONS.select_row,
      payload: traineeWithId as Trainee
    });

    this.newTraineeValue.set(null);
  }

  // Remove a trainee
  removeTrainee(trainee: Trainee | null = null) {
    const traineeToRemove = trainee || this.selectedTrainee().payload;
    if (!traineeToRemove || !traineeToRemove.id) return;

    this.traineeService.removeTrainee(traineeToRemove);
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