import { Injectable, signal } from '@angular/core';
import { Trainee } from '../../models/trainee.model';
import { DATAGRID_SELECT_ACTIONS } from '../../models/data.actions';

@Injectable({
  providedIn: 'root'
})
export class DataTableContainer {

  constructor() { }

  selectedTrainee = signal<{ action: string, payload: Trainee | null }>({ action: DATAGRID_SELECT_ACTIONS.initial, payload: null });

  toggleSelection(value: { action: string; payload: Trainee; }) {
    const selected: { action: string; payload: Trainee | null; } = this.selectedTrainee();
    if (selected.payload?.id === value.payload.id) {
      (selected) ? this.selectedTrainee.set({ action: DATAGRID_SELECT_ACTIONS.deselect_row, payload: null }) :
        this.selectedTrainee.set({ action: DATAGRID_SELECT_ACTIONS.select_row, payload: value.payload });
    } else {
      this.selectedTrainee.set({ action: DATAGRID_SELECT_ACTIONS.select_row, payload: value.payload });
    }
    console.log(this.selectedTrainee());
  }

  filterValue = signal<string | null>('');

  pageState = signal<number | null>(null);

  // addNewTraineeState = signal<boolean>(false);

}
