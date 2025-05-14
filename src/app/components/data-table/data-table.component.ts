import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DATA_COLUMNS } from '../../models/data-table-columns';
import { Trainee } from '../../models/trainee.model';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    MatFormFieldModule, MatInputModule, MatTableModule
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent implements OnChanges {

  @Input({ required: true }) trainees: Trainee[] = [];

  columns = DATA_COLUMNS;
  displayedColumns = DATA_COLUMNS.map(c => c.columnDef);

  dataSource = new MatTableDataSource<Trainee>([]);

  constructor(){
    this.dataSource.filterPredicate =  this.customFilterPredicate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.dataSource.data = this.trainees;
  }


  applyFilter(event: Event) {

    const filterValue = (event.target as HTMLInputElement).value;
    console.log(filterValue)
    this.dataSource.filter = filterValue.trim().toLowerCase();

  }

  private customFilterPredicate(): (data: Trainee, filter: string) => boolean{
    return (data: Trainee, filter: string): boolean => {
      // Keyword: ID:<value>
      const idMatch = filter.match(/^id:(\d+)/i);
      if (idMatch) {
        const id = parseInt(idMatch[1], 10);
        return data.id === id;
      }

      // Keyword: > or < for grade (assuming `data.grade` is number) or date
      const gradeMatch = filter.match(/^([<>])\s*(\d+(\.\d+)?)/);
      if (gradeMatch) {
        const operator = gradeMatch[1];
        const number = parseFloat(gradeMatch[2]);
        return operator === '>' ? data.grade > number : data.grade < number;
      }

      // Keyword: > or < for dates (assuming `data.date` is ISO string)
      const dateMatch = filter.match(/^date([<>])(\d{4}-\d{2}-\d{2})/i);
      if (dateMatch) {
        const operator = dateMatch[1];
        const inputDate = new Date(dateMatch[2]).getTime();
        const traineeDate = new Date(data.date).getTime();
        return operator === '>' ? traineeDate > inputDate : traineeDate < inputDate;
      }

      // Default general filter on name or other text fields
      return (
        data.name?.toLowerCase().includes(filter) 
        ||
        data.subject?.toLowerCase().includes(filter)
      );
    };
  }

}
