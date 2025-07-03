import { Trainee } from '../../models/trainee.model';
import { TraineeService } from '../../providers/trainee.service';
import { DataTableComponent } from '../../components/data-table/data-table.component';
import { DataTableContainer } from '../../components/data-table/data-table-container.service';
import { SELECT_ACTIONS } from '../../models/data.actions';
import { DetailsPanelComponent } from '../../components/details-panel/details-panel.component';
import { Component, inject, Input, computed, effect, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-data-page',
  standalone: true,
  imports: [
    DataTableComponent,
    DetailsPanelComponent
  ],
  templateUrl: './data-page.component.html',
  styleUrl: './data-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataPageComponent{

  // Inject the TraineeService
  traineeService = inject(TraineeService);

  // Input to receive an array of Trainee objects
  @Input() traineesResolver: Trainee[] = [];

  // Define a constant for the SELECT_ACTIONS
  SELECT_ACTIONS = SELECT_ACTIONS;
  // Inject the DataTableContainer
  dataTableContainer = inject(DataTableContainer);
  // Computed property to get the selectedTrainee from the dataTableContainer
  selectedTrainee = computed(() => this.dataTableContainer.selectedTrainee());

  constructor() {
    // Effect to simulate real world data update scenario
    effect(() => {
      /**
       * simulate real world data update scenatio
       */
      this.traineesResolver = this.traineeService.trainees();      
    })
  }


}
