import { Injectable } from '@angular/core';
import { Trainee } from '../../models/trainee.model';

@Injectable({
  providedIn: 'root'
})
export class ChartsUtilService {

  constructor() { }

  formatSelected(selectedTrainees:Trainee[]){

    return selectedTrainees.map(id => {
      const trainee = selectedTrainees.find(s => s.id === id.id);
      return trainee ? `${trainee.id}.${trainee.name}` : `${id}-Unknown`;
    });

  }
}
