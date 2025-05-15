import { Component, effect, input, OnChanges, SimpleChanges } from '@angular/core';
import { Trainee } from '../../models/trainee.model';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
@Component({
  selector: 'app-details-panel',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './details-panel.component.html',
  styleUrl: './details-panel.component.scss'
})
export class DetailsPanelComponent implements OnChanges {

  selectedTrainee = input<Trainee | null>();

  detailsForm = new FormGroup({
    id: new FormControl<number | null>(null),
    name: new FormControl<string>(''),
    grade: new FormControl<number | null>(null),
    email: new FormControl<string | null>(''),
    dateJoined: new FormControl<string | null>(null),
    address: new FormControl<string | null>(''),
    city: new FormControl<string | null>(''),
    country: new FormControl<string | null>(''),
    zip: new FormControl<number | null>(null),
    subject: new FormControl<string>('')
  });

  constructor() {
    effect(() => {
      console.log(this.selectedTrainee())
    });

    this.bindFormData();

  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes)
    console.log(this.selectedTrainee())
  }

  bindFormData() {
    effect(() => {
      const trainee = this.selectedTrainee();
      if (trainee) {
        this.detailsForm.patchValue({
          id: trainee.id ?? '', name: trainee.name ?? '', grade: trainee.grade ?? null,
          email: trainee.email ?? '', dateJoined: trainee.dateJoined, address: trainee?.address ?? '',
          city: trainee?.city ?? '', country: trainee?.country ?? '', zip: trainee.zip ?? null, subject: trainee.subject ?? ''
        });
      } else {
        this.detailsForm.reset({
          id: null, name: '', grade: null, email: '',
          dateJoined: null, address: '', city: '',
          country: '', zip: null, subject: ''
        });
      }
    });
  }

}
