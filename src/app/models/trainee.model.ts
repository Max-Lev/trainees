export interface Trainee {
    id: number;
    name: string;
    subject: string;
    grade: number;
    date: string;
    email?: string;
    dateJoined?: string;
    address?: string;
    city?: string;
    country?: string;
    zip?: string;
  }
  
  export interface TraineeMonitor {
    id: number;
    name: string;
    averageGrade: number;
    passed: boolean;
  }
  
  export interface ChartData {
    id: number;
    type: string;
    title: string;
    data: any;
  }
  
  export enum ChartType {
    TRAINEE_GRADES = 'traineeGrades',
    TRAINEE_SUBJECTS = 'traineeSubjects',
    SUBJECT_AVERAGES = 'subjectAverages'
  }

