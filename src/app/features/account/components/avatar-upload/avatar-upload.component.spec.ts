import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { AvatarUploadComponent } from './avatar-upload.component';
import { AccountService } from '../../services/account.service';
import { Me } from '../../models/account.model';
import { UserRole } from '../../../../core/models/user.model';

const ME: Me = {
  firstName: 'Ada', lastName: 'QA', email: 'ada@empresa.com', role: UserRole.EDITOR,
  avatarUrl: 'http://x/avatar.png',
};

describe('AvatarUploadComponent', () => {
  let component: AvatarUploadComponent;
  let fixture: ComponentFixture<AvatarUploadComponent>;
  let mockService: { uploadAvatar: ReturnType<typeof vi.fn>; deleteAvatar: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockService = {
      uploadAvatar: vi.fn().mockReturnValue(of(ME)),
      deleteAvatar: vi.fn().mockReturnValue(of({ ...ME, avatarUrl: null })),
    };

    await TestBed.configureTestingModule({
      imports: [AvatarUploadComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: AccountService, useValue: mockService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarUploadComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('firstName', 'Ada');
    fixture.componentRef.setInput('lastName', 'QA');
  });

  function file(type: string, sizeBytes: number): File {
    return new File([new Uint8Array(sizeBytes)], 'avatar.png', { type });
  }

  describe('validateFile', () => {
    it('accepts an allowed type under the size limit', () => {
      expect((component as any).validateFile(file('image/png', 500_000))).toBeNull();
    });

    it('rejects a disallowed type', () => {
      expect((component as any).validateFile(file('image/svg+xml', 500))).toBe('account.avatar.error_type');
    });

    it('rejects a file over 2MB', () => {
      expect((component as any).validateFile(file('image/png', 3 * 1024 * 1024))).toBe('account.avatar.error_size');
    });
  });

  describe('upload', () => {
    it('does nothing when no file is staged', () => {
      (component as any).upload();
      expect(mockService.uploadAvatar).not.toHaveBeenCalled();
    });

    it('uploads the staged file and emits the new avatarUrl', () => {
      let emitted: string | null | undefined;
      component.avatarChanged.subscribe((url) => (emitted = url));

      (component as any).stageFile(file('image/png', 500));
      (component as any).upload();

      expect(mockService.uploadAvatar).toHaveBeenCalledTimes(1);
      expect(emitted).toBe('http://x/avatar.png');
      expect((component as any).stagedPreview()).toBeNull();
    });
  });

  describe('confirmDelete', () => {
    it('deletes the avatar and emits null', () => {
      let emitted: string | null | undefined;
      component.avatarChanged.subscribe((url) => (emitted = url));

      (component as any).confirmDelete();

      expect(mockService.deleteAvatar).toHaveBeenCalledTimes(1);
      expect(emitted).toBeNull();
      expect((component as any).confirmingDelete()).toBe(false);
    });
  });
});
