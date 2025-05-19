import { Injectable } from '@angular/core';
import { Trainee } from '../../models/trainee.model';

@Injectable({
  providedIn: 'root'
})
export class ChartsUtilService {

  constructor() { }

  // This function takes an array of Trainee objects and returns an array of strings
  formatSelected(selectedTrainees:Trainee[]){

    // Map through the array of Trainee objects and return a string for each object
    return selectedTrainees.map(id => {
      // Find the Trainee object with the same id as the current object
      const trainee = selectedTrainees.find(s => s.id === id.id);
      // If the Trainee object is found, return a string with the id and name of the Trainee object
      return trainee ? `${trainee.id}.${trainee.name}` : `${id}-Unknown`;
      // If the Trainee object is not found, return a string with the id of the current object and the string "Unknown"
    });

  }
}
