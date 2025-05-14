import { Component } from '@angular/core';

@Component({
  selector: 'app-analysis-page',
  standalone: true,
  imports: [],
  templateUrl: './analysis-page.component.html',
  styleUrl: './analysis-page.component.scss'
})
export class AnalysisPageComponent {
  constructor() { 
    console.log('AnalysisPageComponent loaded')
  }

}
