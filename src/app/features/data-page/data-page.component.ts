import { AfterViewInit, Component, computed, effect, inject, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Trainee } from '../../models/trainee.model';
import { TraineeService } from '../../providers/trainee.service';
import { DataTableComponent } from '../../components/data-table/data-table.component';
import { DataTableContainer } from '../../components/data-table/data-table-container.service';
import { SELECT_ACTIONS } from '../../models/data.actions';
import { DetailsPanelComponent } from '../../components/details-panel/details-panel.component';

@Component({
  selector: 'app-data-page',
  standalone: true,
  imports: [
    DataTableComponent,
    DetailsPanelComponent
  ],
  templateUrl: './data-page.component.html',
  styleUrl: './data-page.component.scss'
})
export class DataPageComponent implements OnChanges, AfterViewInit, OnDestroy {

  traineeService = inject(TraineeService);

  @Input() traineesResolver: Trainee[] = [];

  SELECT_ACTIONS = SELECT_ACTIONS;
  dataTableContainer = inject(DataTableContainer);
  selectedTrainee = computed(() => this.dataTableContainer.selectedTrainee());

  constructor() {
    effect(() => {
      /**
       * simulate real world data update scenatio
       */
      // this.traineesResolver = this.traineeService.trainees$();
      this.traineesResolver = this.traineeService.trainees()
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('DataPageComponent ', changes)
  }

  ngAfterViewInit(): void {

  }

  ngOnDestroy(): void {
    console.log('DataPageComponent ngOnDestroy')
  }

}
