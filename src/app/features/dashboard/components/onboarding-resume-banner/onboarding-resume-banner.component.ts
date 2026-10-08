import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { StorageService } from '../../../../core/storage/storage.service';
import { StorageKeys } from '../../../../core/storage/storage-keys.constants';
import { RouteConstants } from '../../../../core/constants/route.constants';

@Component({
  selector: 'app-onboarding-resume-banner',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './onboarding-resume-banner.component.html',
  styleUrl: './onboarding-resume-banner.component.scss',
})
export class OnboardingResumeBannerComponent {
  private readonly storageService = inject(StorageService);

  /** `false` = onboarding started but not finished/skipped yet; absent/true never show this. */
  protected readonly visible = this.storageService.get<boolean>(StorageKeys.ONBOARDING_DONE) === false;

  protected readonly onboardingPath = ['/', RouteConstants.ONBOARDING];
}
