import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emptyVal',
  standalone: true
})
export class EmptyValPipe implements PipeTransform {

  transform(value: string): string {
    if(value === null || value === "null" || value === undefined || value === "undefined" || value === ''){
      return 'N/A';
    }else{
      return value;
    }
  }

}
