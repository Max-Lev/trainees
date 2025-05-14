import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DATA_COLUMNS } from '../../models/data-table-columns';
import { Trainee } from '../../models/trainee.model';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    MatFormFieldModule, MatInputModule,
    MatTableModule, MatButtonModule,
    MatPaginator, MatPaginatorModule
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent implements OnChanges, OnInit, AfterViewInit {

  @Input({ required: true }) trainees: Trainee[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  columns = DATA_COLUMNS;
  displayedColumns = DATA_COLUMNS.map(c => c.columnDef);

  dataSource = new MatTableDataSource<Trainee>([]);

  constructor() {
    this.dataSource.filterPredicate = this.customFilterPredicate();
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

  private customFilterPredicate(): (data: Trainee, filter: string) => boolean {
    return (data: Trainee, filter: string): boolean => {
      const trimmed = filter.trim().toLowerCase();

      // ID:123
      const idMatch = trimmed.match(/^id:(\d+)/i);
      if (idMatch) {
        const id = parseInt(idMatch[1], 10);
        return data.id === id;
      }

      // Date or Grade: >2023-01-01 or <75
      const rangeMatch = trimmed.match(/^([<>])\s*(\d{4}-\d{2}-\d{2}|\d+(\.\d+)?)/);
      if (rangeMatch) {
        const operator = rangeMatch[1];
        const value = rangeMatch[2];

        // If it's a date string
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          const inputDate = new Date(value).getTime();
          const traineeDate = new Date(data.date).getTime();
          return operator === '>' ? traineeDate > inputDate : traineeDate < inputDate;
        }

        // Else treat as numeric (grade)
        const number = parseFloat(value);
        return operator === '>' ? data.grade > number : data.grade < number;
      }

      // Default: filter by name or subject
      return (
        data.name?.toLowerCase().includes(trimmed) ||
        data.subject?.toLowerCase().includes(trimmed) ||
        data.grade?.toString().includes(trimmed)
      );
    };
  }



  // private customFilterPredicate(): (data: Trainee, filter: string) => boolean {
  //   return (data: Trainee, filter: string): boolean => {
  //     // Keyword: ID:<value>
  //     const idMatch = filter.match(/^id:(\d+)/i);
  //     if (idMatch) {
  //       const id = parseInt(idMatch[1], 10);
  //       return data.id === id;
  //     }

  //     // Keyword: > or < for grade (assuming `data.grade` is number) or date
  //     const gradeMatch = filter.match(/^([<>])\s*(\d+(\.\d+)?)/);
  //     if (gradeMatch) {
  //       const operator = gradeMatch[1];
  //       const number = parseFloat(gradeMatch[2]);
  //       return operator === '>' ? data.grade > number : data.grade < number;
  //     }

  //     // Keyword: > or < for dates (assuming `data.date` is ISO string)
  //     const dateMatch = filter.match(/^date([<>])(\d{4}-\d{2}-\d{2})/i);
  //     console.log(dateMatch)
  //     if (dateMatch) {
  //       const operator = dateMatch[1];
  //       const inputDate = new Date(dateMatch[2]).getTime();
  //       const traineeDate = new Date(data.date).getTime();
  //       console.log('traineeDate', traineeDate,'inputDate', inputDate)
  //       return operator === '>' ? traineeDate > inputDate : traineeDate < inputDate;
  //     }
  //     // Keyword: > or < for dates (assuming `data.date` is "YYYY-MM-DD")
  //     // const dateMatch = filter.match(/^date\s*([<>])\s*(\d{4}-\d{2}-\d{2})$/i);



  //     // Default general filter on name or other text fields
  //     return (
  //       data.name?.toLowerCase().includes(filter) || data.subject?.toLowerCase().includes(filter)
  //     );
  //   };
  // }

  selectedRow(row: Trainee) {

    this.trainees.map((trainee) => {
      if (trainee.id === row.id) {
        return trainee = { ...trainee, ...{ isSelected: true } }
      } else {
        return;
      }
      // trainee.isSelected = trainee.id === row.id;
    });
    console.log(row);
    console.log(this.trainees);
  }

}
