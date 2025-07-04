import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, inject, input, OnDestroy } from '@angular/core';
import { Trainee } from '../../models/trainee.model';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
    grades: new FormGroup({}, { updateOn: 'change' }),
  });

  // This function returns a FormControl for a given subject
  getGradeControl(subject: string): FormControl<number | null> {
    console.log('getGradeControl called for subject:', subject);
    // Get the grades FormGroup from the detailsForm
    const gradesFormGroup = this.detailsForm.get('grades') as FormGroup;

    // If the gradesFormGroup does not have a FormControl for the given subject
    if (!gradesFormGroup.get(subject)) {
      // Add a FormControl for the given subject to the gradesFormGroup
      gradesFormGroup.addControl(
        subject,
        new FormControl<number | null>(null, [Validators.min(0), Validators.max(100)])
      );
      gradesFormGroup.get(subject)?.markAsTouched(); // Mark as touched to trigger validation
      gradesFormGroup.get(subject)?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
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
      console.log('Effect triggered for subject control');
      const subjectControl = this.detailsForm.get('subject');
      const selectedSubject = subjectControl?.value;

      if (selectedSubject && subjectControl) {
        const gradeControl = this.getGradeControl(selectedSubject);
        if (gradeControl) {
          // Immediately check and update the validation state
          gradeControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((val) => {
            this.toggleSubjectControl(subjectControl, gradeControl.invalid);
          });
        }
      }
    });
  }

  /**
 * Toggles the subject control based on the validity of the grade control.
 * @param subjectControl The FormControl for the subject.
 * @param isGradeInvalid Boolean indicating if the grade control is invalid.
 */
  private toggleSubjectControl(subjectControl: AbstractControl, isGradeInvalid: boolean): void {
    console.log('toggleSubjectControl called');
    if (isGradeInvalid) {

      subjectControl.disable({ emitEvent: false });
      subjectControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });

      const gradesFormGroup = this.detailsForm.get('grades') as FormGroup;
      gradesFormGroup.controls[subjectControl.value].markAsTouched();
      gradesFormGroup.controls[subjectControl.value].updateValueAndValidity({ onlySelf: true, emitEvent: false });

    } else {
      subjectControl.enable({ emitEvent: false });
    }
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

      this.dataTableContainer.isAddBtnDisabled.set(!this.detailsForm.valid);
    });
  }

  private onGradeValueChanges$() {
    // Listen for changes in the grades FormGroup
    this.detailsForm.get('grades')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((grades) => {
      console.log('Grades changed:', grades);
      const selectedSubject = this.detailsForm.get('subject')?.value;
      const gradesFormGroup = this.detailsForm.get('grades') as FormGroup;
      // console.log('Grades changed:', this.detailsForm.get('grades'));
      if (this.detailsForm.get('grades')?.invalid) {
        this.detailsForm.get('subject')?.disable({ emitEvent: false });
        // this.detailsForm.get('grades')[''].markAsTouched();
        // this.detailsForm.get('grades').controls[this.detailsForm.get('subject').value]
        gradesFormGroup.controls[selectedSubject!]?.markAsTouched();
        gradesFormGroup.controls[selectedSubject!]?.updateValueAndValidity({ onlySelf: true, emitEvent: false });

      } else {
        this.detailsForm.get('subject')?.enable({ emitEvent: false });
      }
    });
  }

  // Bind selected trainee data to the form
  private bindFormData() {

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

  private validateExistingTrainee(trainee: Trainee) {
    // Then add dynamic controls for grades
    const gradesFormGroup = this.detailsForm.get('grades') as FormGroup;
    for (const [subject, grade] of Object.entries(trainee.grades || {})) {
      if (!gradesFormGroup.get(subject)) {
        gradesFormGroup.addControl(subject, new FormControl<number | null>(
          grade, [Validators.min(0), Validators.max(100)]
        ));
      }
    }
  }

}