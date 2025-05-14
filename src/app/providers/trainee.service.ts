import { Injectable, effect, signal, computed } from '@angular/core';
import { Trainee, TraineeMonitor, ChartData, ChartType } from '../models/trainee.model';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TraineeService {

  private http = inject(HttpClient);

  // === Signal State ===
  private trainees = signal<Trainee[]>([]);
  
  private dataPageState = signal({
    filter: '',
    selectedTrainee: null,
    page: 0,
    pageSize: 10
  });

  private analysisPageState = signal({
    selectedIds: [] as number[],
    selectedSubjects: [] as string[],
    chartLayout: [1, 2]
  });

  private monitorPageState = signal({
    idFilter: [] as number[],
    nameFilter: '',
    showPassed: true,
    showFailed: true
  });

  // === Computed Derivations ===
  trainees$ = computed(() => this.trainees());
  dataPageState$ = computed(() => this.dataPageState());
  analysisPageState$ = computed(() => this.analysisPageState());
  monitorPageState$ = computed(() => this.monitorPageState());

  constructor() {
    // Initial data load
    this.loadTrainees();
  }

  private loadTrainees(): void {
    this.http.get<Trainee[]>('http://localhost:4200/assets/mock-data.json').subscribe({
      next: data => this.trainees.set(data),
      error: err => console.error('Failed to load trainees', err)
    });
  }

  getTrainee(id: number, subject: string): Trainee | undefined {
    return this.trainees().find(t => t.id === id && t.subject === subject);
  }

  saveTrainee(trainee: Trainee): void {
    const current = this.trainees();
    const index = current.findIndex(t => t.id === trainee.id && t.subject === trainee.subject);

    if (index !== -1) {
      const updated = [...current];
      updated[index] = trainee;
      this.trainees.set(updated);
    } else {
      this.trainees.set([...current, trainee]);
    }
  }

  removeTrainee(id: number, subject: string): void {
    const updated = this.trainees().filter(t => !(t.id === id && t.subject === subject));
    this.trainees.set(updated);
  }

  updateDataPageState(state: Partial<typeof this.dataPageState>) {
    this.dataPageState.set({
      ...this.dataPageState(),
      ...state
    });
  }

  updateAnalysisPageState(state: Partial<typeof this.analysisPageState>) {
    this.analysisPageState.set({
      ...this.analysisPageState(),
      ...state
    });
  }

  updateChartLayout(layout: number[]) {
    this.analysisPageState.set({
      ...this.analysisPageState(),
      chartLayout: layout
    });
  }

  updateMonitorPageState(state: Partial<typeof this.monitorPageState>) {
    this.monitorPageState.set({
      ...this.monitorPageState(),
      ...state
    });
  }

  // === Chart Data Logic ===

  getChartData(chartType: ChartType, selectedIds: number[], selectedSubjects: string[]): ChartData {
    const trainees = this.trainees();

    switch (chartType) {
      case ChartType.TRAINEE_GRADES:
        return {
          id: 1,
          type: 'bar',
          title: 'Chart 1: Trainee Grades by Subject',
          data: this.getTraineeGradesData(trainees, selectedIds)
        };
      case ChartType.TRAINEE_SUBJECTS:
        return {
          id: 2,
          type: 'pie',
          title: 'Chart 2: Trainee Subject Distribution',
          data: this.getTraineeSubjectsData(trainees, selectedIds)
        };
      case ChartType.SUBJECT_AVERAGES:
        return {
          id: 3,
          type: 'line',
          title: 'Chart 3: Subject Average Grades',
          data: this.getSubjectAveragesData(trainees, selectedSubjects)
        };
      default:
        return {
          id: 0,
          type: 'bar',
          title: 'Unknown Chart',
          data: {}
        };
    }
  }

  private getTraineeGradesData(trainees: Trainee[], selectedIds: number[]) {
    const filtered = trainees.filter(t => selectedIds.includes(t.id));
    const subjects = [...new Set(filtered.map(t => t.subject))];

    const datasets = selectedIds.map(id => {
      const traineeData = filtered.filter(t => t.id === id);
      const trainee = traineeData[0];
      return {
        label: trainee ? trainee.name : `Trainee ${id}`,
        data: subjects.map(subject => {
          const match = traineeData.find(t => t.subject === subject);
          return match ? match.grade : 0;
        })
      };
    });

    return { labels: subjects, datasets };
  }

  private getTraineeSubjectsData(trainees: Trainee[], selectedIds: number[]) {
    const filtered = trainees.filter(t => selectedIds.includes(t.id));
    const subjects = [...new Set(filtered.map(t => t.subject))];

    const subjectCounts = subjects.map(subject => ({
      subject,
      count: filtered.filter(t => t.subject === subject).length
    }));

    return {
      labels: subjects,
      datasets: [{
        data: subjectCounts.map(sc => sc.count),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#8AC249', '#EA80FC', '#00E5FF', '#FF4081'
        ]
      }]
    };
  }

  private getSubjectAveragesData(trainees: Trainee[], selectedSubjects: string[]) {
    const filtered = trainees.filter(t => selectedSubjects.includes(t.subject));

    const subjectAverages = selectedSubjects.map(subject => {
      const subjectTests = filtered.filter(t => t.subject === subject);
      const average = subjectTests.reduce((sum, t) => sum + t.grade, 0) / subjectTests.length || 0;
      return { subject, average };
    });

    return {
      labels: selectedSubjects,
      datasets: [{
        label: 'Average Grade',
        data: subjectAverages.map(sa => sa.average),
        borderColor: '#4BC0C0',
        fill: false
      }]
    };
  }

  // === Monitor Logic ===
  getTraineesMonitorData(): TraineeMonitor[] {
    const trainees = this.trainees();
    const traineeIds = [...new Set(trainees.map(t => t.id))];

    return traineeIds.map(id => {
      const traineeTests = trainees.filter(t => t.id === id);
      const name = traineeTests[0]?.name || 'Unknown';
      const averageGrade = traineeTests.reduce((sum, t) => sum + t.grade, 0) / traineeTests.length;
      return {
        id,
        name,
        averageGrade,
        passed: averageGrade >= 65
      };
    });
  }
}


// import { inject, Injectable } from '@angular/core';
// import { BehaviorSubject, Observable, of } from 'rxjs';
// import { map, shareReplay } from 'rxjs/operators';
// import { Trainee, TraineeMonitor, ChartData, ChartType } from '../models/trainee.model';

// import { HttpClient } from '@angular/common/http';

// @Injectable({
//   providedIn: 'root'
// })
// export class TraineeService {

//   http = inject(HttpClient);

//   // BehaviorSubjects for state management
//   private traineesSubject = new BehaviorSubject<Trainee[]>([]);
//   private dataPageStateSubject = new BehaviorSubject<any>({
//     filter: '',
//     selectedTrainee: null,
//     page: 0,
//     pageSize: 10
//   });
//   private analysisPageStateSubject = new BehaviorSubject<any>({
//     selectedIds: [],
//     selectedSubjects: [],
//     chartLayout: [1, 2] // Chart IDs in order of display
//   });
//   private monitorPageStateSubject = new BehaviorSubject<any>({
//     idFilter: [],
//     nameFilter: '',
//     showPassed: true,
//     showFailed: true
//   });

//   // Observables
//   trainees$ = this.traineesSubject.asObservable();
//   dataPageState$ = this.dataPageStateSubject.asObservable();
//   analysisPageState$ = this.analysisPageStateSubject.asObservable();
//   monitorPageState$ = this.monitorPageStateSubject.asObservable();

//   constructor() { }

//   setTrainees(trainees: Trainee[]): void {
//     this.getTrainees().subscribe({
//       next: data => this.traineesSubject.next(data),
//       error: (err) => {
//         console.log(err);
//         throw new Error(err);
//       }
//     });
//   }

//   // Data Page Methods
//   getTrainees(): Observable<Trainee[]> {
//     return this.http.get<Trainee[]>('http://localhost:4200/assets/mock-data.json').pipe(shareReplay(1))
//   }

//   getTrainee(id: number, subject: string): Observable<Trainee | undefined> {
//     return this.trainees$.pipe(
//       map(trainees => trainees.find(t => t.id === id && t.subject === subject))
//     );
//   }

//   saveTrainee(trainee: Trainee): void {
//     const trainees = this.traineesSubject.value;
//     const index = trainees.findIndex(t => t.id === trainee.id && t.subject === trainee.subject);

//     if (index !== -1) {
//       // Update existing trainee
//       const updatedTrainees = [...trainees];
//       updatedTrainees[index] = trainee;
//       this.traineesSubject.next(updatedTrainees);
//     } else {
//       // Add new trainee
//       this.traineesSubject.next([...trainees, trainee]);
//     }
//   }

//   removeTrainee(id: number, subject: string): void {
//     const filteredTrainees = this.traineesSubject.value.filter(
//       t => !(t.id === id && t.subject === subject)
//     );
//     this.traineesSubject.next(filteredTrainees);
//   }

//   updateDataPageState(state: any): void {
//     this.dataPageStateSubject.next({
//       ...this.dataPageStateSubject.value,
//       ...state
//     });
//   }

//   // Analysis Page Methods
//   getAllTraineeIds(): Observable<number[]> {
//     return this.trainees$.pipe(
//       map(trainees => [...new Set(trainees.map(t => t.id))])
//     );
//   }

//   getAllSubjects(): Observable<string[]> {
//     return this.trainees$.pipe(
//       map(trainees => [...new Set(trainees.map(t => t.subject))])
//     );
//   }

//   getChartData(chartType: ChartType, selectedIds: number[], selectedSubjects: string[]): ChartData {
//     const trainees = this.traineesSubject.value;

//     switch (chartType) {
//       case ChartType.TRAINEE_GRADES:
//         return {
//           id: 1,
//           type: 'bar',
//           title: 'Chart 1: Trainee Grades by Subject',
//           data: this.getTraineeGradesData(trainees, selectedIds)
//         };
//       case ChartType.TRAINEE_SUBJECTS:
//         return {
//           id: 2,
//           type: 'pie',
//           title: 'Chart 2: Trainee Subject Distribution',
//           data: this.getTraineeSubjectsData(trainees, selectedIds)
//         };
//       case ChartType.SUBJECT_AVERAGES:
//         return {
//           id: 3,
//           type: 'line',
//           title: 'Chart 3: Subject Average Grades',
//           data: this.getSubjectAveragesData(trainees, selectedSubjects)
//         };
//       default:
//         return {
//           id: 0,
//           type: 'bar',
//           title: 'Unknown Chart',
//           data: {}
//         };
//     }
//   }

//   private getTraineeGradesData(trainees: Trainee[], selectedIds: number[]): any {
//     const filteredTrainees = trainees.filter(t => selectedIds.includes(t.id));
//     const subjects = [...new Set(filteredTrainees.map(t => t.subject))];

//     const datasets = selectedIds.map(id => {
//       const traineeData = filteredTrainees.filter(t => t.id === id);
//       const trainee = traineeData[0]; // Get name from first occurrence

//       return {
//         label: trainee ? trainee.name : `Trainee ${id}`,
//         data: subjects.map(subject => {
//           const matchingTest = traineeData.find(t => t.subject === subject);
//           return matchingTest ? matchingTest.grade : 0;
//         })
//       };
//     });

//     return {
//       labels: subjects,
//       datasets
//     };
//   }

//   private getTraineeSubjectsData(trainees: Trainee[], selectedIds: number[]): any {
//     const filteredTrainees = trainees.filter(t => selectedIds.includes(t.id));
//     const subjects = [...new Set(filteredTrainees.map(t => t.subject))];

//     const subjectCounts = subjects.map(subject => {
//       return {
//         subject,
//         count: filteredTrainees.filter(t => t.subject === subject).length
//       };
//     });

//     return {
//       labels: subjects,
//       datasets: [{
//         data: subjectCounts.map(sc => sc.count),
//         backgroundColor: [
//           '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
//           '#FF9F40', '#8AC249', '#EA80FC', '#00E5FF', '#FF4081'
//         ]
//       }]
//     };
//   }

//   private getSubjectAveragesData(trainees: Trainee[], selectedSubjects: string[]): any {
//     const filteredTrainees = trainees.filter(t => selectedSubjects.includes(t.subject));

//     // Group by subject and calculate averages
//     const subjectAverages = selectedSubjects.map(subject => {
//       const subjectTests = filteredTrainees.filter(t => t.subject === subject);
//       const average = subjectTests.reduce((sum, test) => sum + test.grade, 0) / subjectTests.length;
//       return {
//         subject,
//         average: average || 0
//       };
//     });

//     return {
//       labels: selectedSubjects,
//       datasets: [{
//         label: 'Average Grade',
//         data: subjectAverages.map(sa => sa.average),
//         borderColor: '#4BC0C0',
//         fill: false
//       }]
//     };
//   }

//   updateAnalysisPageState(state: any): void {
//     this.analysisPageStateSubject.next({
//       ...this.analysisPageStateSubject.value,
//       ...state
//     });
//   }

//   updateChartLayout(layout: number[]): void {
//     const currentState = this.analysisPageStateSubject.value;
//     this.analysisPageStateSubject.next({
//       ...currentState,
//       chartLayout: layout
//     });
//   }

//   // Monitor Page Methods
//   getTraineesMonitorData(): Observable<TraineeMonitor[]> {
//     return this.trainees$.pipe(
//       map(trainees => {
//         // Get unique trainee IDs
//         const traineeIds = [...new Set(trainees.map(t => t.id))];

//         // Create monitor data for each trainee
//         return traineeIds.map(id => {
//           const traineeResults = trainees.filter(t => t.id === id);
//           const name = traineeResults[0].name;
//           const averageGrade = traineeResults.reduce((sum, t) => sum + t.grade, 0) / traineeResults.length;
//           const passed = averageGrade >= 65;

//           return {
//             id,
//             name,
//             averageGrade,
//             passed
//           };
//         });
//       })
//     );
//   }

//   updateMonitorPageState(state: any): void {
//     this.monitorPageStateSubject.next({
//       ...this.monitorPageStateSubject.value,
//       ...state
//     });
//   }
// }