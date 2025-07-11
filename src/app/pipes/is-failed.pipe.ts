import { inject, Pipe, PipeTransform } from '@angular/core';
import { AverageUtilService } from '../providers/average-util.service';

@Pipe({
  name: 'isFailed',
  standalone: true
})
export class IsFailedPipe implements PipeTransform {

  util = inject(AverageUtilService);

  transform(grades: Record<string, number>) {
    const avg = this.util.calculateAverage(grades);
    return avg >= 65 ? 'passed' : 'failed';
  }

}
