import { ValidatorFn, AbstractControl, ValidationErrors, FormGroup, FormControl, Validators } from "@angular/forms";
import { Trainee } from "../../models/trainee.model";

export const gradeControlValidator: ValidatorFn = (
    formGroup: AbstractControl,
): ValidationErrors | null => {

    const gradesFormGroup = formGroup.get('grades') as FormGroup;
    const subjectControl = formGroup.get('subject') as FormControl;

    if (!gradesFormGroup || !subjectControl) return null;

    const gradeControl = gradesFormGroup.get(subjectControl.value || '');
    if (gradeControl && gradeControl.invalid) {
        return { invalidGrade: true };
    }

    return null;
};

// Export a function called existingIdValidator that takes in an array of Trainee objects and a selected Trainee object
export function existingIdValidator(trainees: Trainee[], selectedTrainee: Trainee | null): ValidatorFn {
    // Return a function that takes in an AbstractControl object
    return (control: AbstractControl): ValidationErrors | null => {
        // Get the value of the control
        const value = Number(control.value);
        // If the value is not a number, return null
        if (!value || isNaN(value)) return null;

        // Check if the selectedTrainee is not null
        const isEditing = Boolean(selectedTrainee);
        // Get the id of the selectedTrainee
        const currentId = selectedTrainee?.id;

        // Check if there is a duplicate id in the trainees array
        const isDuplicate = trainees.some(t => t.id === value && (!isEditing || t.id !== currentId));
        
        // If there is a duplicate, return an object with the key 'existingId' and the value true
        return isDuplicate ? { existingId: true } : null;
    }
};


export function validateExistingTrainee(trainee: Trainee, getGradesFormGroup: FormGroup): void {
    // Then add dynamic controls for grades
    const gradesFormGroup = getGradesFormGroup;
    for (const [subject, grade] of Object.entries(trainee.grades || {})) {
        if (!gradesFormGroup.get(subject)) {
            gradesFormGroup.addControl(subject, new FormControl<number | null>(
                grade, [Validators.min(0), Validators.max(100)]
            ));
        }
    }
}