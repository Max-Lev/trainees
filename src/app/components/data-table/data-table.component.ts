import {
  AfterViewInit, ChangeDetectorRef, Component, computed, effect, inject, Input,
  OnDestroy, OnInit, ViewChild
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
import { DetailsPanelComponent } from '../details-panel/details-panel.component';
import { SELECT_ACTIONS } from '../../models/data.actions';
import { Subject } from 'rxjs';

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
export class DataTableComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();

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

  activeActionState = computed(() =>
    this.dataTableContainer.selectedTrainee().action
  );

  // When you get new input data
  @Input() set trainees(value: Trainee[]) {
    if (!value) return;

    // Add index property to each trainee
    const indexedTrainees = value.map((val, index) => ({ ...val, _index: index }));
    this.dataTableContainer.trainees.set(indexedTrainees);
  }

  // Get trainees directly from the container
  get trainees(): Trainee[] {
    return this.dataTableContainer.trainees();
  }

  constructor() {
    // Initialize custom filter predicate
    this.setCustomFilterPredicate();

    // Connect data source to trainees signal
    this.setTableDataSource();
  }

  ngOnInit(): void {

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

    // Listen for search input changes
    this.form.controls.search.valueChanges.pipe(
      debounceTime(500),
      takeUntil(this.destroy$)
    ).subscribe((filterValue: string | null) => {
      const value = filterValue || '';
      this.dataTableContainer.setFilter(value);
      this.dataSource.filter = value.trim().toLowerCase();
    });

    // Restore filter if available
    const savedFilter = this.dataTableContainer.filterValue();
    if (savedFilter) {
      this.form.controls.search.setValue(savedFilter, { emitEvent: false });
      this.dataSource.filter = savedFilter.trim().toLowerCase();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Set up data source with reactive signal data
  setTableDataSource() {
    effect(() => {
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
    const currentAction = this.activeActionState();

    if (currentAction === SELECT_ACTIONS.open_panel) {
      // Save the new trainee
      this.dataTableContainer.addNewTrainee();
    } else if (currentAction === SELECT_ACTIONS.select_row) {
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