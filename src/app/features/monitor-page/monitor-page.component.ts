import { AfterViewInit, Component, computed, effect, inject, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgClass } from '@angular/common';
import { MonitorStateService } from './monitor-state.service';
import { MONITOR_COLUMNS } from '../../models/data-table-columns';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { DataTableContainer } from '../../components/data-table/data-table-container.service';
import { Trainee } from '../../models/trainee.model';
import { IsFailedPipe } from '../../pipes/is-failed.pipe';

@Component({
  selector: 'app-monitor-page',
  standalone: true,
  imports: [
    MatFormFieldModule, MatSelectModule, MatInputModule,
    MatCheckboxModule, MatTableModule, 
    MatPaginator, MatPaginatorModule,
    NgClass,
    IsFailedPipe
  ],
  providers:[],
  templateUrl: './monitor-page.component.html',
  styleUrl: './monitor-page.component.scss'
})
export class MonitorPageComponent implements AfterViewInit {
  // Define columns for the data table
  columns = MONITOR_COLUMNS;
  // Define displayed columns for the data table
  displayedColumns = MONITOR_COLUMNS.map(c => c.columnDef);;
  // Get a reference to the MatPaginator component
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Inject the MonitorStateService and DataTableContainer
  state = inject(MonitorStateService);
  dataTableContainer = inject(DataTableContainer);
  // Get all trainee ids
  allIds = this.state.allTrainees().map(t => t.id);
  // Get filtered trainees
  trainees = this.state.filteredTrainees;

  dataSource = new MatTableDataSource<Trainee>([]);
  constructor() {
    effect(() => {
    // Effect to update the data source with the filtered trainees
      this.dataSource.data = this.trainees();
    });
  }

  ngAfterViewInit(): void {

    // Connect paginator to data source
    this.dataSource.paginator = this.paginator;
    setTimeout(() => {
      // Restore paginator state if available
      const savedPageState = this.state.pageState();
      if (savedPageState) {
        this.paginator.pageIndex = savedPageState.pageIndex;
        this.paginator.pageSize = savedPageState.pageSize;
        this.paginator._changePageSize(this.paginator.pageSize);
      }
    });
  }


    pageSelected(event: PageEvent) {
    // Set the page state when a page is selected
      this.state.setPageState({
        pageIndex: event.pageIndex,
        pageSize: event.pageSize
      });
    }


}
