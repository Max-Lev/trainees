export interface Trainee {
  id: number;
  name: string | null;
  subject: string;
  grade: number;
  date: string;
  email?: string;
  dateJoined?: string | null;
  address?: string;
  city?: string;
  country?: string;
  zip?: number;
  phone?: number | null;
  state?: string;
  age?: number;
  _index?: number;
  grades?: Record<string, number>;
  average?: number;
  exams?: number;

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

