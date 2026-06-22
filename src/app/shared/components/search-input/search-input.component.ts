import { Component, input, output } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'app-search-input',
  imports: [IconComponent],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss',
})
export class SearchInputComponent {
  readonly placeholder = input('');
  readonly searched = output<string>();

  protected onInput(event: Event): void {
    this.searched.emit((event.target as HTMLInputElement).value);
  }
}
