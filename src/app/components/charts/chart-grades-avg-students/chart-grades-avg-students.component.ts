import { Component, OnChanges, Input, SimpleChanges } from "@angular/core";
import { NgxChartsModule } from "@swimlane/ngx-charts";

@Component({
  selector: 'app-chart-grades-average',
  standalone: true,
  imports: [
    NgxChartsModule
  ],
  templateUrl: './chart-grades-avg-students.component.html',
  styleUrl: './chart-grades-avg-students.component.scss'
})
export class ChartGradesAverageStudetnsComponent implements OnChanges {

  // @Input() selectedTrainee: Trainee[] = [];

  // averageUtilService = inject(AverageUtilService);

  // private selectedTraineeSignal: WritableSignal<Trainee[]> = signal([]);

  @Input({ required: true }) studentsAverages: { name: string; value: number; }[] = [];
  
  @Input() xAxisLabel = '';
  @Input() yAxisLabel = '';

  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;

  constructor() {
    
  }
  ngOnChanges(changes: SimpleChanges): void {
    
  }

  onSelect(event: any) {
    
  }


}
