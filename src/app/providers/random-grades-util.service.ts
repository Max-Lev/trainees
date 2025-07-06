import { Injectable } from '@angular/core';
import { Trainee } from '../models/trainee.model';

@Injectable({
  providedIn: 'root'
})
export class RandomGradesUtilService {

  constructor() { }

  generateRandomGradesOverTime(
    trainee: Trainee,
    startDate: string,
    endDate: string,
    intervalDays: number = 90
  ): { date: string; average: number; grades: Record<string, number> }[] {
    const gradesOverTime: { date: string; average: number; grades: Record<string, number> }[] = [];
    const subjects = Object.keys(trainee.grades || {});
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + intervalDays)) {
      const gradesSnapshot: Record<string, number> = {};

      subjects.forEach((subject) => {
        const randomGrade = Math.floor(Math.random() * 101); // Generate random grade between 0 and 100
        gradesSnapshot[subject] = randomGrade;
      });

      // Calculate the average grade for the snapshot
      const average =
        subjects.length > 0
          ? Object.values(gradesSnapshot).reduce((sum, grade) => sum + grade, 0) / subjects.length
          : 0;

      gradesOverTime.push({
        date: date.toISOString().slice(0, 10),// Format date as YYYY-MM-DD
        average: parseFloat(average.toFixed(2)), // Round average to 2 decimal places
        grades: gradesSnapshot,
      });
    }

    return gradesOverTime;
  }

}
