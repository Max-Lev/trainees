import { AfterViewInit, Component, inject, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Trainee } from '../../models/trainee.model';
import { TraineeService } from '../../providers/trainee.service';
import { DataTableComponent } from '../../components/data-table/data-table.component';

@Component({
  selector: 'app-data-page',
  standalone: true,
  imports: [
    DataTableComponent
  ],
  templateUrl: './data-page.component.html',
  styleUrl: './data-page.component.scss'
})
export class DataPageComponent implements OnChanges, AfterViewInit,OnDestroy {

  traineeService = inject(TraineeService);

  @Input() traineesResolver: Trainee[] = [];

  constructor() {
    
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    console.log('DataPageComponent ',changes)
  }

  ngAfterViewInit(): void {

  }

  ngOnDestroy(): void {
    console.log('DataPageComponent ngOnDestroy')
  }

}
