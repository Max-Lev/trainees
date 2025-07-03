import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, inject, input, OnDestroy } from '@angular/core';
import { Trainee } from '../../models/trainee.model';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
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
  styleUrl: './details-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsPanelComponent implements AfterViewInit, OnDestroy {

  destroyed$ = new Subject<void>();
  // Input signal for the selected trainee
  selectedTrainee = input<Trainee | null>(null);

  // Service injection
  dataTableContainer = inject(DataTableContainer);
  subjectsService = inject(SubjectsService);
  subjectOptions = computed(() => this.subjectsService.subjects());

  // private gradesValidator = (control: AbstractControl): ValidationErrors | null => {
  //   const grades = control.value as Record<string, number>;
  //   if (!grades || typeof grades !== 'object') {
  //     return null; // Let other validators handle null/undefined
  //   }

  //   const errors: ValidationErrors = {};
  //   let hasErrors = false;

  //   for (const [subject, grade] of Object.entries(grades)) {
  //     if (typeof grade === 'number') {
  //       if (grade < 0) {
  //         errors[`${subject}_min`] = { min: { actual: grade, min: 0 } };
  //         hasErrors = true;
  //       }
  //       if (grade > 100) {
  //         errors[`${subject}_max`] = { max: { actual: grade, max: 100 } };
  //         hasErrors = true;
  //       }
  //     }
  //   }

  //   return hasErrors ? errors : null;
  // };

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
    grades: new FormGroup({}, { updateOn: 'change' }),
  });

  // This function returns a FormControl for a given subject
  getGradeControl(subject: string): FormControl<number | null> {
    // Get the grades FormGroup from the detailsForm
    const gradesFormGroup = this.detailsForm.get('grades') as FormGroup;

    // If the gradesFormGroup does not have a FormControl for the given subject
    if (!gradesFormGroup.get(subject)) {
      // Add a FormControl for the given subject to the gradesFormGroup
      gradesFormGroup.addControl(
        subject,
        new FormControl<number | null>(null, [Validators.min(0), Validators.max(100)])
      );
    }

    // Return the FormControl for the given subject
    return gradesFormGroup.get(subject) as FormControl<number | null>;
  }



  constructor() {
    // Bind form data when selected trainee changes
    this.bindFormData();
    /**
     * disable immidiatly onPress subject control if grade is invalid
     */
    effect(() => {
      const selected = this.detailsForm.get('subject')?.value;
      const subjectControl = this.detailsForm.get('subject');

      if (selected && subjectControl) {
        const gradeControl = this.getGradeControl(selected);
        gradeControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
          debugger;
          if (gradeControl.invalid) {
            subjectControl.disable({ emitEvent: false });
          } else {
            subjectControl.enable({ emitEvent: false });
          }
        });
      }
    });

  }


  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngAfterViewInit(): void {
    this.onformValueChanges$(); // Subscribe to form value changes
    this.disableInvalidSubjectControl(); // Disable subject control if grade is invalid
  }

  onformValueChanges$() {
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

      this.dataTableContainer.isAddBtnDisabled.set(!this.detailsForm.valid);
    });
  }

  // Disable subject control if grade is invalid
  disableInvalidSubjectControl() {
    this.detailsForm.get('grades')?.statusChanges.pipe(takeUntil(this.destroyed$)).subscribe((isValid) => {
      if (isValid === 'INVALID') {
        this.detailsForm.get('subject')?.disable({ emitEvent: false });
      }
    });
  }

  // Bind selected trainee data to the form
  bindFormData() {

    effect(() => {
      const trainee = this.selectedTrainee();
      const { action } = this.dataTableContainer.selectedTrainee();

      if (trainee) {
        // Populate form with trainee data
        this.detailsForm.get('subject')?.enable({ emitEvent: false });

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
          subject: (trainee.subject) ? trainee.subject : ''
        });
        this.validateExistingTrainee(trainee);

      } else if (action === SELECT_ACTIONS.open_panel) {
        // Clear form for new trainee
        this.detailsForm.reset();
      }
    });
  }

  validateExistingTrainee(trainee: Trainee) {
    // Then add dynamic controls for grades
    const gradesGroup = this.detailsForm.get('grades') as FormGroup;
    for (const [subject, grade] of Object.entries(trainee.grades || {})) {
      if (!gradesGroup.get(subject)) {
        gradesGroup.addControl(subject, new FormControl<number | null>(
          grade, [Validators.min(0), Validators.max(100)]
        ));
      }
    }
  }

  onSubjectGradeInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const grade = Number(input.value);

    if (!isNaN(grade)) {
      const current = this.detailsForm.get('grades')?.value ?? {};
      const subject = this.detailsForm.controls.subject.getRawValue();
      if (subject) {
        const gradesControl = this.detailsForm.get('grades');
        gradesControl?.setValue({
          ...current,
          [subject]: grade
        });
        // Mark the grades control as touched to trigger validation display
        gradesControl?.markAsTouched();
      }
    }
  }




}