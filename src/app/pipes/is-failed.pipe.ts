import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isFailed',
  standalone: true
})
export class IsFailedPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): string {
    return (value >= 65) ? 'passed' : 'failed';
  }

}
