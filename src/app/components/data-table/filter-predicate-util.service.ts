import { Injectable } from '@angular/core';
import { Trainee } from '../../models/trainee.model';

@Injectable({
  providedIn: 'root'
})
export class FilterPredicateUtilService {

   // This function returns a custom filter predicate function
   customFilterPredicate(): (data: Trainee, filter: string) => boolean {
      return (data: Trainee, filter: string): boolean => {
        const trimmed = filter.trim().toLowerCase();
  
        // ID:123
        const idMatch = trimmed.match(/^id:(\d+)/i);
        if (idMatch) {
          const id = parseInt(idMatch[1], 10);
          return data.id === id;
        }
  
        // Date or Grade: >2023-01-01 or <75
        const rangeMatch = trimmed.match(/^([<>])\s*(\d{4}-\d{2}-\d{2}|\d+(\.\d+)?)/);
        if (rangeMatch) {
          const operator = rangeMatch[1];
          const value = rangeMatch[2];
  
          // If it's a date string
          if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const inputDate = new Date(value).getTime();
            const traineeDate = new Date(data.date).getTime();
            return operator === '>' ? traineeDate > inputDate : traineeDate < inputDate;
          }
  
          // Else treat as numeric (grade)
          const number = parseFloat(value);
          return operator === '>' ? data.grade > number : data.grade < number;
        }
  
        // Default: filter by name or subject
        return (
          data.name?.toLowerCase().includes(trimmed) ||
          data.subject?.toLowerCase().includes(trimmed) ||
          data.grade?.toString().includes(trimmed) ||
          data.date?.toString().includes(trimmed)
        );
      };
    }
  
}
