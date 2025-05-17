import { AfterViewInit, Component, effect, inject, input } from '@angular/core';
import { Trainee } from '../../models/trainee.model';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { SELECT_ACTIONS } from '../../models/data.actions';
import { DataTableContainer } from '../data-table/data-table-container.service';

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
export class DetailsPanelComponent implements AfterViewInit {
  // Input signal for the selected trainee
  selectedTrainee = input<Trainee | null>(null);
  
  // Service injection
  dataTableContainer = inject(DataTableContainer);

  // Form for trainee details
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
    // Bind form data when selected trainee changes
    this.bindFormData();
  }

  ngAfterViewInit(): void {
    // Update the appropriate signal when form values change
    this.detailsForm.valueChanges.subscribe((value) => {
      const action = this.dataTableContainer.selectedTrainee().action;
      
      if (action === SELECT_ACTIONS.select_row) {
        // Update existing trainee
        this.dataTableContainer.updatedTraineeValue.set(value as any);
      } else if (action === SELECT_ACTIONS.open_panel) {
        // New trainee
        this.dataTableContainer.newTraineeValue.set(value as any);
      }
    });
  }

  // Bind selected trainee data to the form
  bindFormData() {
    effect(() => {
      const trainee = this.selectedTrainee();
      const action = this.dataTableContainer.selectedTrainee().action;
      
      if (trainee) {
        // Populate form with trainee data
        this.detailsForm.patchValue({
          id: trainee.id ?? null, 
          name: trainee.name ?? '', 
          grade: trainee.grade ?? null,
          email: trainee.email ?? '', 
          dateJoined: trainee.dateJoined ?? null, 
          address: trainee.address ?? '',
          city: trainee.city ?? '', 
          country: trainee.country ?? '', 
          zip: trainee.zip ?? null, 
          subject: trainee.subject ?? ''
        });
      } else if (action === SELECT_ACTIONS.open_panel) {
        // Clear form for new trainee
        this.detailsForm.reset({
          id: null, name: '', grade: null, email: '',
          dateJoined: null, address: '', city: '',
          country: '', zip: null, subject: ''
        });
      }
    });
  }
}