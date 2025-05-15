import { AfterViewInit, ChangeDetectorRef, Component, effect, inject, Input, OnChanges, OnDestroy, OnInit, signal, SimpleChanges, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DATA_COLUMNS } from '../../models/data-table-columns';
import { Trainee } from '../../models/trainee.model';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataTableContainerService } from './data-table-container.service';
import { FilterPredicateUtilService } from './filter-predicate-util.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, of } from 'rxjs';
@Component({
  selector: 'app-data-table',
  imports: [
    MatFormFieldModule, MatInputModule,
    MatTableModule, MatButtonModule,
    MatPaginator, MatPaginatorModule,
    ReactiveFormsModule,

  ],
  standalone: true,
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {

  cdr = inject(ChangeDetectorRef);
  dataTableContainerService = inject(DataTableContainerService);
  filterPredicateUtilService = inject(FilterPredicateUtilService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  columns = DATA_COLUMNS;
  displayedColumns = DATA_COLUMNS.map(c => c.columnDef);

  dataSource = new MatTableDataSource<Trainee>([]);

  _selectedTrainee = this.dataTableContainerService.selectedTrainee;

  form = new FormGroup({
    search: new FormControl<string | null>(this.dataTableContainerService.filterValue()),
    addBtn: new FormControl<string | null>(''),
    removeBtn: new FormControl<string | null>(''),
  });


  private readonly _trainees = signal<Trainee[]>([]);
  @Input() set trainees(value: Trainee[]) { this._trainees.set(value); }
  get trainees(): Trainee[] { return this._trainees(); }

  constructor() {

    this.setCustomFilterPredicate();
    this.setTableDataSource();
    this.searchInputState();

    effect(() => {
      console.log(this._selectedTrainee())
    });

    // this._pageState = toSignal(
    //   this.paginator?.page.asObservable() ?? of(null),
    //   { initialValue: undefined }
    // );

    // effect(() =>{
    //   console.log(this._pageState())
    // })

  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    // this.dataSource.data = this.trainees;
  }
  ngAfterViewInit(): void {
    this.setPaginatorDataSource();

    this.form.controls.search.valueChanges.pipe(debounceTime(1000)).subscribe((filterValue: string | null) => {
      
      this.dataTableContainerService.filterValue.set(filterValue);
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
      this.dataSource.filter = this.dataTableContainerService.filterValue() ?? '';
    });
  }

  selectedRowHandler(row: Trainee) {
    this.dataTableContainerService.toggleSelection(row)
  }

  pageSelected($event: PageEvent) {
    this.dataTableContainerService.pageState.set($event.pageSize);
  }

  paginationState() {
    this.paginator.pageSize = this.dataTableContainerService.pageState() ?? 0;
  }

  addTrainee(){
    // save edited panel data
  }

}
