// analysis-state.service.ts
import { Injectable, signal, computed, inject, effect, WritableSignal } from '@angular/core';
import { TraineeService } from '../../providers/trainee.service';
import { SubjectsService } from '../../providers/subjects.service';
import { Trainee } from '../../models/trainee.model';

export interface ChartInfo {
  id: string;
  title: string;
  visible: boolean;
  position: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalysisStateService {

  // Injecting services
  analysisTraineeService = inject(TraineeService);
  traineeService = inject(TraineeService);

  subjectsService = inject(SubjectsService);
  private _availableSubjects = computed(() => this.subjectsService.subjects());
  public availableSubjects = computed(() => this._availableSubjects());
  public selectedSubjects = computed(() => this._selectedSubjects());
  // Chart configurations
  private _charts = signal<ChartInfo[]>([
    { id: 'chart1', title: 'Trainees grades averages', visible: true, position: 0 },
    { id: 'chart2', title: 'Subjects averages', visible: true, position: 1 },
    // { id: 'chart3', title: 'Grades averages per subject', visible: false, position: 2 }
  ]);


  constructor() {
    effect(() => {
      console.log('selectedIds ', this.selectedIds())
      console.log('_selectedIds ', this._selectedIds())
      // console.log('availableIds',this.availableIds())
      // console.log('_availableIds ',this._availableIds())
    })
  }

  // Available data
  private _availableIds = computed(() => {
    // return this.analysisTraineeService.trainees().map(trainee => {
    return this.traineeService.trainees().map(trainee => {
      return trainee;
    });
  });

  // Selected filters
  private _selectedIds = signal<Trainee[]>([]);
  private _selectedSubjects = signal<string[]>([]);

  // Computed properties
  public availableIds = computed(() => {
    debugger
    console.log(this._availableIds())
    return this._availableIds();
  });

  public selectedIds = computed(() => {
    return this._selectedIds();
  });

  public visibleCharts = computed(() => {
    return this._charts()
      .filter(chart => chart.visible)
      .sort((a, b) => a.position - b.position);
  });

  public hiddenCharts = computed(() => {
    return this._charts().filter(chart => !chart.visible);
  });

  // Update methods
  updateSelectedIds(trainees: Trainee[]) {
    debugger
    this._selectedIds.set(trainees);
  }

  // :WritableSignal<Trainee[]>
  getSelectedIds() {
    console.log(this._selectedIds())
    // return this.selectedIds;
    return this._selectedIds;
  }

  // This function updates the selected subjects by setting the subjects array to the _selectedSubjects set
  updateSelectedSubjects(subjects: string[]) {
    // Set the _selectedSubjects set to the subjects array
    this._selectedSubjects.set(subjects);
  }

  getSelectedSubjects(): WritableSignal<string[]> {
    return this._selectedSubjects;
  }

  reorderCharts(previousIndex: number, currentIndex: number) {
    // Create a copy of the charts array
    const charts = [...this._charts()];
    // Filter out the charts that are not visible
    const visibleCharts = charts.filter(chart => chart.visible);

    // Get the chart being moved
    const movedChart = visibleCharts[previousIndex];

    // Update positions
    visibleCharts.forEach(chart => {
      // If chart is between new and old position, shift it accordingly
      if (previousIndex < currentIndex) {
        if (chart.position > movedChart.position && chart.position <= currentIndex) {
          chart.position--;
        }
      } else {
        if (chart.position >= currentIndex && chart.position < movedChart.position) {
          chart.position++;
        }
      }
    });

    // Set the moved chart's new position
    movedChart.position = currentIndex;

    // Update the charts signal
    this._charts.set(charts);
  }

  // Function to swap the position of two charts
  swapChart(hiddenChart: ChartInfo, targetIndex: number) {
    // Create a copy of the charts array
    const charts = [...this._charts()];
    // Filter the visible charts from the copy
    const visibleCharts = charts.filter(chart => chart.visible);

    // Check if the target index is within the range of the visible charts
    if (targetIndex >= 0 && targetIndex < visibleCharts.length) {
      // Get the target chart from the visible charts
      const targetChart = visibleCharts[targetIndex];

      // Make the hidden chart visible and the target chart hidden
      // Find the index of the hidden chart and the target chart in the copy
      const hiddenChartIndex = charts.findIndex(c => c.id === hiddenChart.id);
      const targetChartIndex = charts.findIndex(c => c.id === targetChart.id);

      // Check if the hidden chart and target chart are found in the copy
      if (hiddenChartIndex !== -1 && targetChartIndex !== -1) {
        // Set the hidden chart to be visible and set its position to the target chart's position
        charts[hiddenChartIndex].visible = true;
        charts[hiddenChartIndex].position = targetChart.position;

        // Set the target chart to be hidden
        charts[targetChartIndex].visible = false;

        // Update the charts array
        this._charts.set(charts);
      }
    }
  }
}