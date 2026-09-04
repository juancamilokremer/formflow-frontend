import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

const PREVIEW_SECONDS = 3;
const TICK_MS = 1000;

type Phase = 'preview' | 'running' | 'expired';
type ColorState = 'green' | 'yellow' | 'red';

@Component({
  selector: 'app-time-limit-countdown',
  imports: [TranslatePipe],
  templateUrl: './time-limit-countdown.component.html',
  styleUrl: './time-limit-countdown.component.scss',
})
export class TimeLimitCountdownComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly translateSvc = inject(TranslateService);

  readonly totalSeconds = input.required<number>();
  readonly variant = input<'question' | 'global'>('question');

  protected readonly phase = signal<Phase>('preview');
  protected readonly remaining = signal<number>(0);
  protected readonly announcement = signal<string>('');

  protected readonly colorState = computed<ColorState>(() => {
    const total = this.totalSeconds();
    if (!total) return 'green';
    const fraction = this.remaining() / total;
    if (fraction > 0.5) return 'green';
    if (fraction > 0.2) return 'yellow';
    return 'red';
  });

  protected readonly progressPercent = computed(() => {
    const total = this.totalSeconds();
    return total ? Math.round((this.remaining() / total) * 100) : 0;
  });

  protected readonly showSecondsCountdown = computed(() => this.remaining() <= 10);

  ngOnInit(): void {
    this.remaining.set(this.totalSeconds());

    const previewTimeout = setTimeout(() => {
      this.phase.set('running');
      const intervalId = setInterval(() => this.tick(), TICK_MS);
      this.destroyRef.onDestroy(() => clearInterval(intervalId));
    }, PREVIEW_SECONDS * 1000);

    this.destroyRef.onDestroy(() => clearTimeout(previewTimeout));
  }

  private tick(): void {
    const wasAboveTen = this.remaining() > 10;
    const next = this.remaining() - 1;

    if (next <= 0) {
      this.remaining.set(0);
      this.phase.set('expired');
      this.announcement.set(this.translateSvc.instant('responder.time_limit.aria_expired'));
      return;
    }

    this.remaining.set(next);
    if (wasAboveTen && next <= 10) {
      this.announcement.set(this.translateSvc.instant('responder.time_limit.aria_under_ten'));
    }
  }
}
