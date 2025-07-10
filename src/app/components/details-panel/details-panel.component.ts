import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, inject, input, OnDestroy } from '@angular/core';
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
import { existingIdValidator, gradeControlValidator, validateExistingTrainee } from './custom.validators';

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
  styleUrl: './details-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsPanelComponent implements AfterViewInit, OnDestroy {

  // Service injection
  dataTableContainer = inject(DataTableContainer);
  subjectsService = inject(SubjectsService);

  destroyed$ = new Subject<void>();
  // Input signal for the selected trainee
  selectedTrainee = input<Trainee | null>(null);

  subjectOptions = computed(() => this.subjectsService.subjects());

  // Form for trainee details
  detailsForm = new FormGroup({
    id: new FormControl<number | null>(null, [Validators.required, Validators.pattern(/^\d{1,9}$/)]),
    name: new FormControl<string>('', [Validators.required]),
    email: new FormControl<string | null>(''),
    dateJoined: new FormControl<string | null>(null),
    address: new FormControl<string | null>(''),
    city: new FormControl<string | null>(''),
    country: new FormControl<string | null>(''),
    zip: new FormControl<number | null>(null),
    subject: new FormControl<string>(''),
    grades: new FormGroup({}),
  }, { validators: gradeControlValidator, updateOn: 'change' });

  private getGradesFormGroup = (): FormGroup => this.detailsForm.get('grades') as FormGroup;

  // This function returns a FormControl for a given subject
  getGradeControl(subjectSelectedCtrl: string): FormControl<number | null> {
    // Get the grades FormGroup from the detailsForm
    const gradesFormGroup = this.getGradesFormGroup()

    // If the gradesFormGroup does not have a FormControl for the given subject
    if (!gradesFormGroup.get(subjectSelectedCtrl)) {
      // Add a FormControl for the given subject to the gradesFormGroup
      gradesFormGroup.addControl(subjectSelectedCtrl,
        new FormControl<number | null>(null, [Validators.min(0), Validators.max(100)]));
    }
    // Return the FormControl for the given subject
    return gradesFormGroup.get(subjectSelectedCtrl) as FormControl<number | null>;
  }

  constructor() {
    // Bind form data when selected trainee changes
    this.bindFormData();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngAfterViewInit(): void {
    this.onformValueChanges$(); // Subscribe to form value changes
    this.onGradeValueChanges$(); // Subscribe to grade value changes
  }

  private onformValueChanges$() {
    // Update the appropriate signal when form values change
    this.detailsForm.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((value) => {
      const { action } = this.dataTableContainer.selectedTrainee();
      if (action === SELECT_ACTIONS.select_row) {
        // Update existing trainee
        this.dataTableContainer.updatedTraineeValue.set(value as Trainee);
      } else if (action === SELECT_ACTIONS.open_panel) {
        // New trainee
        this.dataTableContainer.newTraineeValue.set(value as Trainee);
      }
      // console.log('this.detailsForm.valid ', this.detailsForm.valid, this.detailsForm)
      this.dataTableContainer.isAddBtnDisabled.set(!this.detailsForm.valid);
    });
  }

  private onGradeValueChanges$() {
    // Listen for changes in the grades FormGroup
    this.detailsForm.get('grades')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((grades) => {

      const selectedSubject = this.detailsForm.get('subject');
      const gradesFormGroup = this.getGradesFormGroup();

      if (gradesFormGroup.invalid) {
        selectedSubject?.disable({ emitEvent: false });
        // trigger immidiate user error 
        if (selectedSubject?.value && gradesFormGroup.controls[selectedSubject.value]) {
          const gradeControl = gradesFormGroup.get(selectedSubject.value);
          if (gradeControl) {
            gradeControl.markAsTouched();
          }
        }
      } else {
        selectedSubject?.enable({ emitEvent: false });
      }
    });
  }

  // Bind selected trainee data to the form
  private bindFormData() {
    effect(() => {
      const trainee = this.selectedTrainee();
      const { action } = this.dataTableContainer.selectedTrainee();
  
      const idControl = this.detailsForm.get('id');
      const gradesFormGroup = this.getGradesFormGroup();
  
      if (trainee) {
        // ✏️ Editing existing trainee
        this.detailsForm.patchValue({
          id: trainee.id,
          name: trainee.name ?? '',
          email: trainee.email ?? '',
          dateJoined: trainee.dateJoined ?? null,
          address: trainee.address ?? '',
          city: trainee.city ?? '',
          country: trainee.country ?? '',
          zip: trainee.zip ?? null,
          grades: trainee.grades || {},
          subject: trainee.subject || ''
        });
  
        // Add grade controls for all subjects
        validateExistingTrainee(trainee, gradesFormGroup);
  
      } else if (action === SELECT_ACTIONS.open_panel) {
        // ➕ Adding a new trainee — reset everything!
        this.detailsForm.reset();
        gradesFormGroup.reset();
      }
  
      // ✅ Always set up all ID validators
      idControl?.clearValidators();
      idControl?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{1,9}$/),
        existingIdValidator(this.dataTableContainer.trainees(), this.selectedTrainee())
      ]);
      idControl?.updateValueAndValidity();
    });
  }
  

  



}


