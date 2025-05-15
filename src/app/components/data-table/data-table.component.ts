import {
  AfterViewInit, ChangeDetectorRef, Component, computed, effect, inject, Input,
  OnChanges, OnDestroy, OnInit, signal, SimpleChanges, ViewChild
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DATA_COLUMNS } from '../../models/data-table-columns';
import { Trainee } from '../../models/trainee.model';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataTableContainer } from './data-table-container.service';
import { FilterPredicateUtilService } from './filter-predicate-util.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, of } from 'rxjs';
import { DetailsPanelComponent } from '../details-panel/details-panel.component';
import { JsonPipe } from '@angular/common';
import { DATAGRID_SELECT_ACTIONS as SELECT_ACTIONS } from '../../models/data.actions';
@Component({
  selector: 'app-data-table',
  imports: [
    MatFormFieldModule, MatInputModule,
    MatTableModule, MatButtonModule,
    MatPaginator, MatPaginatorModule,
    ReactiveFormsModule,
    DetailsPanelComponent,
    // JsonPipe

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


  private readonly _trainees = signal<Trainee[]>([]);
  @Input() set trainees(value: Trainee[]) { this._trainees.set(value); }
  get trainees(): Trainee[] { return this._trainees(); }

  // addNewTraineeState = this.dataTableContainerService.addNewTraineeState;

  DATAGRID_SELECT_ACTIONS = SELECT_ACTIONS;
  selectedTrainee = this.dataTableContainer.selectedTrainee;

  isRemoveBtnDisabled = computed(() => {
    return this.dataTableContainer.selectedTrainee().action === SELECT_ACTIONS.select_row ? false : true;
  });

  constructor() {

    this.setCustomFilterPredicate();
    this.setTableDataSource();
    this.searchInputState();

    effect(() => {
      console.log('selectedTrainee: ', this.selectedTrainee())
      // console.log('addNewTraineeState: ', this.addNewTraineeState())
    });

  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    // this.dataSource.data = this.trainees;
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



  }

  ngOnDestroy(): void {
    console.log('destroyed')
  }

  setTableDataSource() {
    effect(() => {
      this.dataSource.data = this._trainees();
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

  selectedRowHandler(row: Trainee) {
    this.dataTableContainer.toggleSelection({ action: SELECT_ACTIONS.select_row, payload: row });
    // this.addNewTraineeState = false;
  }

  pageSelected($event: PageEvent) {
    this.dataTableContainer.pageState.set($event.pageSize);
  }

  paginationState() {
    this.paginator.pageSize = this.dataTableContainer.pageState() ?? 0;
  }

  addTrainee() {
    this.dataTableContainer.selectedTrainee.set({ action: SELECT_ACTIONS.add_trainee, payload: null });

  }

}
