import { Component, input, OnChanges, SimpleChanges } from '@angular/core';
import { Trainee } from '../../models/trainee.model';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-details-panel',
  standalone: true,
  imports: [
    JsonPipe
  ],
  templateUrl: './details-panel.component.html',
  styleUrl: './details-panel.component.scss'
})
export class DetailsPanelComponent implements OnChanges {

  selectedTrainee = input<Trainee | null>();

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes)
  }

}
