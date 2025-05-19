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
  columns = MONITOR_COLUMNS;
  displayedColumns = MONITOR_COLUMNS.map(c => c.columnDef);;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  state = inject(MonitorStateService);
  dataTableContainer = inject(DataTableContainer);
  allIds = this.state.allTrainees().map(t => t.id);
  trainees = this.state.filteredTrainees;

  dataSource = new MatTableDataSource<Trainee>([]);
  constructor() {
    effect(() => {
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
      this.state.setPageState({
        pageIndex: event.pageIndex,
        pageSize: event.pageSize
      });
    }


}
