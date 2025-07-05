import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, effect, inject, 
  input, OnDestroy, ViewChild
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
import { debounceTime, takeUntil } from 'rxjs';
import { SELECT_ACTIONS } from '../../models/data.actions';
import { Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { EmptyValPipe } from '../../pipes/empty-val.pipe';

@Component({
  selector: 'app-data-table',
  imports: [
    MatFormFieldModule, MatInputModule,
    MatTableModule, MatButtonModule,
    MatPaginator, MatPaginatorModule,
    ReactiveFormsModule,
    DatePipe,
    EmptyValPipe
  ],
  standalone: true,
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableComponent implements AfterViewInit, OnDestroy {
  // Create a subject to destroy observables
  private destroy$ = new Subject<void>();

  // Get the paginator from the view
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  cdr = inject(ChangeDetectorRef);
  // Services
  dataTableContainer = inject(DataTableContainer);
  filterPredicateUtilService = inject(FilterPredicateUtilService);


  // Table configuration
  columns = DATA_COLUMNS;
  displayedColumns = DATA_COLUMNS.map(c => c.columnDef);
  dataSource = new MatTableDataSource<Trainee>([]);

  // Form for filter and actions
  form = new FormGroup({
    search: new FormControl<string>(this.dataTableContainer.filterValue())
  });

  // Action states
  SELECT_ACTIONS = SELECT_ACTIONS;
  selectedTrainee = computed(() => this.dataTableContainer.selectedTrainee());

  // Computed properties for UI states
  isRemoveBtnDisabled = computed(() =>
    this.dataTableContainer.selectedTrainee().action !== SELECT_ACTIONS.select_row
  );

  isAddBtnDisabled = this.dataTableContainer.isAddBtnDisabled;

  trainees = input<Trainee[]>([]);

  constructor() {
    // Initialize custom filter predicate
    this.setCustomFilterPredicate();
    // Connect data source to trainees signal
    this.setTableDataSource();
  }

  ngAfterViewInit(): void {

    // Connect paginator to data source
    this.dataSource.paginator = this.paginator;
    setTimeout(() => {
      // Restore paginator state if available
      const savedPageState = this.dataTableContainer.pageState();
      if (savedPageState) {
        this.paginator.pageIndex = savedPageState.pageIndex;
        this.paginator.pageSize = savedPageState.pageSize;
        this.paginator._changePageSize(this.paginator.pageSize);
      }
    });

    this.onSearchValueChanges$(); // Subscribe to search value changes

    this.restoreFilterValue(); // Restore filter value from container
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Listen for search input changes
  onSearchValueChanges$() {
    this.form.controls.search.valueChanges.pipe(debounceTime(750), takeUntil(this.destroy$))
      .subscribe((filterValue: string | null) => {
        const value = filterValue || '';
        this.dataTableContainer.setFilter(value);
        this.dataSource.filter = value.trim().toLowerCase();
      });
  }

  restoreFilterValue() {
    // Restore filter if available
    const savedFilter = this.dataTableContainer.filterValue();
    if (savedFilter) {
      this.form.controls.search.setValue(savedFilter, { emitEvent: false });
      this.dataSource.filter = savedFilter.trim().toLowerCase();
    }
  }

  // Set up data source with reactive signal data
  // This function sets the data source for the table
  setTableDataSource() {
    // This effect will run whenever the data table container changes
    effect(() => {
      // Set the data source for the table to the trainees from the data table container
      this.dataSource.data = this.dataTableContainer.trainees();
    });
  }

  // Set up custom filter predicate
  setCustomFilterPredicate() {
    this.dataSource.filterPredicate = this.filterPredicateUtilService.customFilterPredicate();
  }

  // Handle pagination events
  pageSelected(event: PageEvent) {
    this.dataTableContainer.setPageState({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize
    });
  }

  // Handle row selection
  selectedRowHandler(row: Trainee) {
    this.dataTableContainer.toggleSelection({
      action: SELECT_ACTIONS.select_row,
      payload: row
    });
  }

  // Add a new trainee
  addTrainee() {
    // const currentAction = this.activeActionState();
    const { action } = this.selectedTrainee();

    if (action === SELECT_ACTIONS.open_panel) {
      // Save the new trainee
      this.dataTableContainer.addNewTrainee();
    } else if (action === SELECT_ACTIONS.select_row) {
      // Save updates to existing trainee

      const updatedTraineeValue = this.dataTableContainer.updatedTraineeValue();

      this.dataTableContainer.updateTrainee(updatedTraineeValue || {});
    } else {
      // Open the add panel if not already open
      this.dataTableContainer.openAddPanel();
    }
  }

  // Remove the selected trainee
  removeTrainee() {
    if (this.selectedTrainee().payload) {
      this.dataTableContainer.removeTrainee();
    }
  }
}