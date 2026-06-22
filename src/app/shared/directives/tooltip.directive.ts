import { Directive, ElementRef, HostListener, OnDestroy, inject, input } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private tip: HTMLElement | null = null;

  readonly appTooltip = input.required<string>();

  @HostListener('mouseenter')
  show(): void {
    const text = this.appTooltip();
    if (!text || this.tip) return;

    this.tip = document.createElement('div');
    this.tip.className = 'ff-tooltip';
    this.tip.textContent = text;
    this.tip.setAttribute('role', 'tooltip');
    document.body.appendChild(this.tip);
    this.position();
  }

  @HostListener('mouseleave')
  @HostListener('click')
  hide(): void {
    this.tip?.remove();
    this.tip = null;
  }

  ngOnDestroy(): void {
    this.hide();
  }

  private position(): void {
    if (!this.tip) return;
    const r = this.el.nativeElement.getBoundingClientRect();
    this.tip.style.position = 'fixed';
    this.tip.style.left = `${r.left + r.width / 2}px`;
    this.tip.style.top = `${r.top - 8}px`;
    this.tip.style.transform = 'translate(-50%, -100%)';
    this.tip.style.zIndex = '9999';
  }
}
