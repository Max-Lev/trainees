import { AfterViewInit, Component, effect, inject, input, OnChanges, SimpleChanges } from '@angular/core';
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
export class DetailsPanelComponent implements OnChanges, AfterViewInit {

  selectedTrainee = input<Trainee | null>();

  dataTableContainer = inject(DataTableContainer)

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
      console.log('@input selectedTrainee: ',this.selectedTrainee());
      // console.log(this.dataTableContainer.updatedTraineeValue());

    });

    this.bindFormData();

  }
  ngAfterViewInit(): void {
    this.detailsForm.valueChanges.subscribe((value) => {
      
      const action = this.dataTableContainer.selectedTrainee().action;
      if(action===SELECT_ACTIONS.select_row){
        
        this.dataTableContainer.updatedTraineeValue.update(_ => value as any);
      }else{
        // this.dataTableContainer.selectedTrainee.set({ action: SELECT_ACTIONS.add_new_trainee, payload: null});
        this.dataTableContainer.newTraineeValue.set(value as any);
        // this.detailsForm.reset();
        
      }
      
      
    })
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
          id: trainee.id ?? null, name: trainee.name ?? '', grade: trainee.grade ?? null,
          email: trainee.email ?? '', dateJoined: trainee.dateJoined, address: trainee?.address ?? '',
          city: trainee?.city ?? '', country: trainee?.country ?? '', zip: trainee.zip ?? null, subject: trainee.subject ?? ''
        });
      } else if(this.dataTableContainer.selectedTrainee().action === SELECT_ACTIONS.initial){
        this.detailsForm.reset({
          id: null, name: '', grade: null, email: '',
          dateJoined: null, address: '', city: '',
          country: '', zip: null, subject: ''
        });
      }
    });
  };


  // saveTrainee() {
  //   const formData = this.detailsForm.value;
  //   const currentAction = this.dataTableContainer.selectedTrainee().action;

  //   if (currentAction === SELECT_ACTIONS.add_new_trainee) {
  //     // const newTrainee: Trainee = { ...formData, id: generateUniqueId() };
  //     const newTrainee: Trainee = { ...formData, id: 11111 };
  //     this.dataTableContainer.addNewTrainee(newTrainee);
  //   }

  //   if (currentAction === SELECT_ACTIONS.update_existing_trainee) {
  //     const updatedTrainee: Trainee = { ...this.selectedTrainee, ...formData };
  //     this.dataTableContainer.updateTrainee(updatedTrainee);
  //   }

  //   this.dataTableContainer.selectedTrainee.set({ action: SELECT_ACTIONS.initial, payload: null });
  // }



}
