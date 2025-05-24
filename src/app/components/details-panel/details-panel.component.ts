import { AfterViewInit, Component, computed, effect, inject, input, OnDestroy } from '@angular/core';
import { Trainee } from '../../models/trainee.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { SELECT_ACTIONS } from '../../models/data.actions';
import { DataTableContainer } from '../data-table/data-table-container.service';
import { SubjectsService } from '../../providers/subjects.service';
import { MatSelectModule } from '@angular/material/select';
import { NgIf } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-details-panel',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    NgIf
  ],
  templateUrl: './details-panel.component.html',
  styleUrl: './details-panel.component.scss'
})
export class DetailsPanelComponent implements AfterViewInit,OnDestroy {

  destroyed$ = new Subject<void>();
  // Input signal for the selected trainee
  selectedTrainee = input<Trainee | null>(null);

  // Service injection
  dataTableContainer = inject(DataTableContainer);
  subjectsService = inject(SubjectsService);
  subjectOptions = computed(() => this.subjectsService.subjects());


  // Form for trainee details
  detailsForm = new FormGroup({
    id: new FormControl<number | null>(null,[Validators.required]),
    name: new FormControl<string>('',[Validators.required]),
    email: new FormControl<string | null>(''),
    dateJoined: new FormControl<string | null>(null),
    address: new FormControl<string | null>(''),
    city: new FormControl<string | null>(''),
    country: new FormControl<string | null>(''),
    zip: new FormControl<number | null>(null),
    selectedSubject: new FormControl<string>(''),
    grades: new FormControl<Record<string, number>>({}),
  });


  constructor() {
    // Bind form data when selected trainee changes
    this.bindFormData();


  }
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngAfterViewInit(): void {
    // Update the appropriate signal when form values change
    this.detailsForm.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((value) => {
      const action = this.dataTableContainer.selectedTrainee().action;
      
      if (action === SELECT_ACTIONS.select_row) {

        this.dataTableContainer.updatedTraineeValue.set(value as any);
      } else if (action === SELECT_ACTIONS.open_panel) {
        // New trainee
        this.dataTableContainer.newTraineeValue.set(value as any);
      }
      
      this.dataTableContainer.isAddBtnDisabled.set(!this.detailsForm.valid);
      
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
          email: trainee.email ?? '',
          dateJoined: trainee.dateJoined ?? null,
          address: trainee.address ?? '',
          city: trainee.city ?? '',
          country: trainee.country ?? '',
          zip: trainee.zip ?? null,
          grades: trainee.grades || {},
          selectedSubject: Object.keys(trainee.grades ?? {})[0] ?? ''
        });

      } else if (action === SELECT_ACTIONS.open_panel) {
        // Clear form for new trainee
        this.detailsForm.reset({
          id: null, name: '',
          email: '',
          dateJoined: null, address: '', city: '',
          country: '', zip: null,
          grades: {}, selectedSubject: ''
        });
      }
    });
  }

  onSGradeInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const grade = Number(input.value);

    if (!isNaN(grade)) {
      const current = this.detailsForm.get('grades')?.value ?? {};
      const subject = this.detailsForm.controls.selectedSubject.getRawValue();
      if (subject) {
        this.detailsForm.get('grades')?.setValue({
          ...current,
          [subject]: grade
        });
      }
    }
  }




}