import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormDetail } from '../../../../models/form.model';

@Component({
  selector: 'app-score-summary-bar',
  imports: [TranslatePipe],
  templateUrl: './score-summary-bar.component.html',
  styleUrl: './score-summary-bar.component.scss',
})
export class ScoreSummaryBarComponent {
  readonly form = input.required<FormDetail>();

  protected readonly stats = computed(() => {
    let count = 0;
    let total = 0;
    for (const section of this.form().sections) {
      for (const q of section.questions) {
        const st = (q.config['scoringType'] as string) ?? 'none';
        if (st === 'none') continue;
        count++;
        if (st === 'auto') {
          total += 10;
        } else {
          const options = (q.config['options'] as { score?: number }[] | undefined) ?? [];
          total += options.reduce((m, o) => Math.max(m, o.score ?? 0), 0);
        }
      }
    }
    return { count, total };
  });
}
