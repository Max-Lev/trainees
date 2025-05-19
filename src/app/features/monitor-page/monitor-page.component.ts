import { Component, computed, effect, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgClass } from '@angular/common';
import { MonitorStateService } from './monitor-state.service';

@Component({
  selector: 'app-monitor-page',
  standalone: true,
  imports: [
    MatFormFieldModule, MatSelectModule, MatInputModule, 
    MatCheckboxModule, MatTableModule,NgClass
  ],
  templateUrl: './monitor-page.component.html',
  styleUrl: './monitor-page.component.scss'
})
export class MonitorPageComponent {
  columns = ['id', 'name', 'average', 'exams'];
  
  state = inject(MonitorStateService);
  allIds = this.state.allTrainees().map(t => t.id);
  trainees = this.state.filteredTrainees;

  
  constructor(){
    
  }
}
