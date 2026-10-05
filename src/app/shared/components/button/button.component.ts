import { Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-button',
  imports: [RouterLink, NgTemplateOutlet],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  readonly variant = input<'primary' | 'secondary' | 'ghost' | 'outline-primary' | 'light' | 'danger'>('primary');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly fullWidth = input(false);
  readonly iconOnly = input(false);
  readonly danger = input(false);
  readonly title = input<string | null>(null);
  /** Renders as `<a [routerLink]>` instead of `<button>` — for CTAs that navigate. */
  readonly routerLink = input<string | string[] | null>(null);
  /** Renders as `<a [href]>` instead of `<button>` — for mailto:/external links. */
  readonly href = input<string | null>(null);
}
