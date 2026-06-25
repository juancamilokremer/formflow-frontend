import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { BasePropertiesComponent } from '../base-properties.component';

@Component({
  selector: 'app-file-properties',
  imports: [TranslatePipe],
  templateUrl: './file-properties.component.html',
  styleUrl: './file-properties.component.scss',
})
export class FilePropertiesComponent extends BasePropertiesComponent {}
