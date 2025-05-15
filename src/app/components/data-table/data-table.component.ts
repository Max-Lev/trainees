import { AfterViewInit, ChangeDetectorRef, Component, effect, inject, Input, OnChanges, OnDestroy, OnInit, signal, SimpleChanges, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DATA_COLUMNS } from '../../models/data-table-columns';
import { Trainee } from '../../models/trainee.model';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { JsonPipe } from '@angular/common';
import { DataTableContainerService } from './data-table-container.service';
import { FilterPredicateUtilService } from './filter-predicate-util.service';
@Component({
  selector: 'app-data-table',
  imports: [
    MatFormFieldModule, MatInputModule,
    MatTableModule, MatButtonModule,
    MatPaginator, MatPaginatorModule,

  ],
  standalone: true,
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {

  cdr = inject(ChangeDetectorRef);
  dataTableContainerService = inject(DataTableContainerService);
  filterPredicateUtilService = inject(FilterPredicateUtilService);

  @Input({ required: true }) trainees: Trainee[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  columns = DATA_COLUMNS;
  displayedColumns = DATA_COLUMNS.map(c => c.columnDef);

  dataSource = new MatTableDataSource<Trainee>([]);

  _selectedTrainee = this.dataTableContainerService.selectedTrainee;

  constructor() {
    this.dataSource.filterPredicate = this.filterPredicateUtilService.customFilterPredicate();
    effect(()=>{
      console.log(this._selectedTrainee())
    })
  }
  ngOnDestroy(): void {
    console.log('destroyed')
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.dataSource.data = this.trainees;
  }
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    console.log(filterValue)
    this.dataSource.filter = filterValue.trim().toLowerCase();

  }

  selectedRowHandler(row: Trainee) {
    this.dataTableContainerService.toggleSelection(row)
  }

}
