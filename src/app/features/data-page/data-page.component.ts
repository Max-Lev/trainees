import { AfterViewInit, Component, effect, inject, input, Input, OnChanges, signal, Signal, SimpleChanges, WritableSignal } from '@angular/core';
import { Trainee } from '../../models/trainee.model';
import { TraineeService } from '../../providers/trainee.service';
import { DataTableComponent } from '../../components/data-table/data-table.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-data-page',
  standalone: true,
  imports: [
    DataTableComponent
  ],
  templateUrl: './data-page.component.html',
  styleUrl: './data-page.component.scss'
})
export class DataPageComponent implements OnChanges,AfterViewInit {
 
  route = inject(Router);
  aroute = inject(ActivatedRoute);

  traineeService = inject(TraineeService);

  @Input() traineesResolver: Trainee[] = [];
  
  // traineesSignal = input<Trainee[]>();


  constructor(){
    // effect(() => {
    //   const trainees = this.traineesSignal();
    //   if (trainees && trainees?.length > 0) {
    //     // You can call any methods or perform logic when trainees signal updates
    //     console.log('Updated trainees:', trainees);
    //   }
    // });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);
    // console.log(this.traineesResolver);
    // if (changes['traineesResolver'] && this.traineesResolver.length > 0) {
    // // if (changes['traineesResolver']) {
    //   // This is where you might set the trainees signal
      
    //   console.log(changes['traineesResolver'],changes)
    //   console.log(this.traineesSignal())
    // }
    // console.log(changes);
    // console.log(this.traineesResolver);
    // if (changes['traineesResolver'] && this.traineesResolver.length > 0) {
    //   // this.traineesSignal.set(this.traineesResolver);
    // }
  }

  ngAfterViewInit(): void {
  //  this.traineeService.trainees$.subscribe(trainees => {
  //    console.log(trainees);
  //  });
  //  console.log(this.route)
  //  console.log(this.aroute)
  }
}
