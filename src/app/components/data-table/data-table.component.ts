import {
  AfterViewInit, ChangeDetectorRef, Component, computed, effect, inject, Input,
  OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DATA_COLUMNS } from '../../models/data-table-columns';
import { Trainee } from '../../models/trainee.model';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { DataTableContainer } from './data-table-container.service';
import { FilterPredicateUtilService } from './filter-predicate-util.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { DetailsPanelComponent } from '../details-panel/details-panel.component';
import { SELECT_ACTIONS } from '../../models/data.actions';
@Component({
  selector: 'app-data-table',
  imports: [
    MatFormFieldModule, MatInputModule,
    MatTableModule, MatButtonModule,
    MatPaginator, MatPaginatorModule,
    ReactiveFormsModule,
    DetailsPanelComponent,


  ],
  standalone: true,
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {

  cdr = inject(ChangeDetectorRef);
  dataTableContainer = inject(DataTableContainer);
  filterPredicateUtilService = inject(FilterPredicateUtilService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  columns = DATA_COLUMNS;

  displayedColumns = DATA_COLUMNS.map(c => c.columnDef);

  dataSource = new MatTableDataSource<Trainee>([]);


  form = new FormGroup({
    search: new FormControl<string | null>(this.dataTableContainer.filterValue()),
    addBtn: new FormControl<string | null>(''),
    removeBtn: new FormControl<string | null>(''),
  });


  // private readonly _trainees = signal<Trainee[]>([]);
  // @Input() set trainees(value: Trainee[]) { 
  //   this._trainees.set(value); 
  //   this.dataTableContainer.trainees.set(value);
  // }
  // get trainees(): Trainee[] { 
  //   return this._trainees(); 
  // }

  // When you get new input
  @Input() set trainees(value: Trainee[]) {
    this.dataTableContainer.trainees.set(value);
  }

  // Use this signal directly from service
  get trainees(): Trainee[] {
    return this.dataTableContainer.trainees();
  }

  SELECT_ACTIONS = SELECT_ACTIONS;
  selectedTrainee = this.dataTableContainer.selectedTrainee;

  isRemoveBtnDisabled = computed(() => {
    return this.dataTableContainer.selectedTrainee().action === SELECT_ACTIONS.select_row ? false : true;
  });

  activeActionState = computed(() => {
    return this.dataTableContainer.selectedTrainee().action;
  });



  constructor() {

    this.setCustomFilterPredicate();
    this.setTableDataSource();
    this.searchInputState();

    effect(() => {
      // console.log('selectedTrainee: ', this.selectedTrainee())
      // console.log('action: ', this.dataTableContainer.selectedTrainee().action)
      console.log('activeActionState: ', this.activeActionState())
      console.log('dataTableContainer trainees: ', this.dataTableContainer.trainees())
      // console.log('_trainees: ', this._trainees())
    });

    // effect(() => {
    //   this._trainees.set(this.dataTableContainer.trainees());
    // });

  }

  ngOnInit(): void {
    // this.dataTableContainer.selectedTrainee.set(
    //   {
    //     "action": "SELECT_ROW_ACTION",
    //     "payload": {
    //       "id": 5,
    //       "name": "Jane Doe",
    //       "subject": "Biology",
    //       "grade": 58,
    //       "date": "2023-01-25",
    //       "email": "jane@example.com",
    //       "dateJoined": "2022-09-05",
    //       "address": "456 Park Ave",
    //       "city": "New York",
    //       "country": "USA",
    //       "zip": 10001
    //     }
    //   }
    // )
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes)
  }

  ngAfterViewInit(): void {
    this.setPaginatorDataSource();

    this.form.controls.search.valueChanges.pipe(debounceTime(1000)).subscribe((filterValue: string | null) => {

      this.dataTableContainer.filterValue.set(filterValue);
      if (filterValue) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
      } else {
        this.dataSource.filter = '';
      }
    });

    this.paginationState();

    // this._trainees.set(this.dataTableContainer.trainees());

  }

  ngOnDestroy(): void {
    console.log('destroyed')
  }

  setTableDataSource() {
    effect(() => {
      // this.dataSource.data = this._trainees();
      this.dataSource.data = this.dataTableContainer.trainees();
    });
  }

  setPaginatorDataSource() {
    this.dataSource.paginator = this.paginator;
  }

  setCustomFilterPredicate() {
    this.dataSource.filterPredicate = this.filterPredicateUtilService.customFilterPredicate();
  }

  searchInputState() {
    effect(() => {
      this.dataSource.filter = this.dataTableContainer.filterValue() ?? '';
    });
  }

  pageSelected($event: PageEvent) {
    this.dataTableContainer.pageState.set($event.pageSize);
  }

  paginationState() {
    this.paginator.pageSize = this.dataTableContainer.pageState() ?? 0;
  }


  selectedRowHandler(row: Trainee) {
    this.dataTableContainer.toggleSelection({ action: SELECT_ACTIONS.select_row, payload: row });
    // this.addNewTraineeState = false;
  }


  // prevAction: string = '';
  addTrainee() {
    // this.dataTableContainer.selectedTrainee.set({
    //   action: SELECT_ACTIONS.open_details_panel, payload: null
    // });
    console.log(this.dataTableContainer.selectedTrainee().action);

    //no selection on the grid
    // if(this.dataTableContainer.selectedTrainee().action===SELECT_ACTIONS.initial){
    if (this.activeActionState() === SELECT_ACTIONS.initial || this.activeActionState() === SELECT_ACTIONS.deselect_row) {
      this.dataTableContainer.selectedTrainee.set({ action: SELECT_ACTIONS.add_trainee, payload: null });
      debugger
    }
    if (this.activeActionState() === SELECT_ACTIONS.select_row) {
      let trainee: Trainee = this.dataTableContainer.selectedTrainee().payload!;
      trainee = {
        ...trainee,
        name: "Max",
        // id: 1000
      }
      this.dataTableContainer.updateTrainee(trainee);
      // this.dataTableContainer.selectedTrainee.set({ action: SELECT_ACTIONS.select_row, payload: trainee });
      debugger
    }



    //after initial not selection action
    // if (this.dataTableContainer.selectedTrainee().action === SELECT_ACTIONS.add_trainee) {
    //   debugger
    // }

    // //trainee selected
    // if (this.dataTableContainer.selectedTrainee().action === SELECT_ACTIONS.select_row) {
    //   this.dataTableContainer.selectedTrainee.set({ action: SELECT_ACTIONS.update_existing_trainee, payload: null });
    //   debugger
    // }

  }
  // addMode = signal(false);

  // addTrainee() {
  //   const currentAction = this.dataTableContainer.selectedTrainee().action;

  //   if (currentAction === SELECT_ACTIONS.select_row) {
  //     // User clicked add while a row is selected — clear selection and prep for add
  //     this.dataTableContainer.selectedTrainee.set({
  //       action: SELECT_ACTIONS.add_new_trainee,
  //       payload: null
  //     });
  //     this.addMode.set(true);
  //     return;
  //   }

  //   if (currentAction === SELECT_ACTIONS.initial) {
  //     // No row selected yet, just open empty form
  //     this.dataTableContainer.selectedTrainee.set({
  //       action: SELECT_ACTIONS.add_new_trainee,
  //       payload: null
  //     });
  //     this.addMode.set(true);
  //     return;
  //   }

  //   if (currentAction === SELECT_ACTIONS.add_new_trainee && this.addMode()) {
  //     // Form is open and user confirms add (e.g. from panel Save button)
  //     const newTrainee: Trainee = /* collect from child form or service */;
  //     this.dataTableContainer.addNewTrainee(newTrainee);
  //     this.dataTableContainer.selectedTrainee.set({
  //       action: SELECT_ACTIONS.initial,
  //       payload: null
  //     });
  //     this.addMode.set(false);
  //   }
  // }


}
