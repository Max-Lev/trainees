// analysis-state.service.ts
import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { DataTableContainer } from '../../components/data-table/data-table-container.service';
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

  dataTableContainer = inject(DataTableContainer);
  traineeService = inject(TraineeService);

  // Available data
  private _availableIds = computed(() => {
    return this.traineeService.trainees().map(trainee => {
      return trainee;
    });
  });

  subjectsService = inject(SubjectsService);
  private _availableSubjects = computed(() => this.subjectsService.subjects());
  
  constructor() {
    // effect(() => {
    //   console.log(this._availableIds())
    // })
  }

  // Selected filters
  private _selectedIds = signal<Trainee[]>([]);
  private _selectedSubjects = signal<string[]>([]);

  // Chart configurations
  private _charts = signal<ChartInfo[]>([
    { id: 'chart1', title: 'Grades average over time for students with ID', visible: true, position: 0 },
    { id: 'chart2', title: 'Students averages for students with chosen ID', visible: true, position: 1 },
    { id: 'chart3', title: 'Grades averages per subject', visible: false, position: 2 }
  ]);

  // Computed properties
  public availableIds = computed(() => this._availableIds());
  public availableSubjects = computed(() => this._availableSubjects());
  public selectedIds = computed(() => {
    return this._selectedIds();
  });
  public selectedSubjects = computed(() => this._selectedSubjects());

  public visibleCharts = computed(() => {
    return this._charts()
      .filter(chart => chart.visible)
      .sort((a, b) => a.position - b.position);
  });

  public hiddenCharts = computed(() => {
    return this._charts().filter(chart => !chart.visible);
  });

  // Update methods
  // updateSelectedIds(ids: string[]) {
  updateSelectedIds(ids: Trainee[]) {
    this._selectedIds.set(ids);
  }

  updateSelectedSubjects(subjects: string[]) {
    this._selectedSubjects.set(subjects);
  }

  reorderCharts(previousIndex: number, currentIndex: number) {
    const charts = [...this._charts()];
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

  swapChart(hiddenChart: ChartInfo, targetIndex: number) {
    const charts = [...this._charts()];
    const visibleCharts = charts.filter(chart => chart.visible);

    if (targetIndex >= 0 && targetIndex < visibleCharts.length) {
      const targetChart = visibleCharts[targetIndex];

      // Make the hidden chart visible and the target chart hidden
      const hiddenChartIndex = charts.findIndex(c => c.id === hiddenChart.id);
      const targetChartIndex = charts.findIndex(c => c.id === targetChart.id);

      if (hiddenChartIndex !== -1 && targetChartIndex !== -1) {
        charts[hiddenChartIndex].visible = true;
        charts[hiddenChartIndex].position = targetChart.position;

        charts[targetChartIndex].visible = false;

        this._charts.set(charts);
      }
    }
  }
}