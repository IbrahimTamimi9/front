import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';

import { SettingsGeneralComponent } from './general.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Client } from '../../../services/api/client';
import { By } from '@angular/platform-browser';
import { Session } from '../../../services/session';
import { clientMock } from '../../../../tests/client-mock.spec';
import { MaterialMock } from '../../../../tests/material-mock.spec';
import { sessionMock } from '../../../../tests/session-mock.spec';
import { CommonModule } from '@angular/common';
import { MaterialTextfieldMock } from '../../../mocks/common/directives/material/text-field-mock.spec';
import { thirdPartyNetworksServiceMock } from '../../../mocks/services/third-party-networks-mock.spec';
import { ThirdPartyNetworksService } from '../../../services/third-party-networks';
import { Observable } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';
import { ActivatedRoute, Router } from '@angular/router';

let routerMock = new function() {
  this.navigate = jasmine.createSpy('navigate');
};

describe('SettingsGeneralComponent', () => {

  let comp: SettingsGeneralComponent;
  let fixture: ComponentFixture<SettingsGeneralComponent>;

  function getSaveButton(): DebugElement {
    return fixture.debugElement.query(By.css('.m-settings--action > button.m-btn.m-btn--slim.m-btn--action'));
  }

  function getSavedButton(): DebugElement {
    return fixture.debugElement.query(By.css('.m-settings--action > button.m-btn.m-btn--slim:not(.m-btn--action)'));
  }

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [MaterialMock, MaterialTextfieldMock, SettingsGeneralComponent], // declare the test component
      imports: [RouterTestingModule, ReactiveFormsModule, CommonModule, FormsModule],
      providers: [
        { provide: Session, useValue: sessionMock },
        { provide: Client, useValue: clientMock },
        { provide: ThirdPartyNetworksService, useValue: thirdPartyNetworksServiceMock },
        { provide: ActivatedRoute, useValue: { params: of({ 'guid': '1000' }) } },
        { provide: Router, useValue: routerMock },
      ]
    })
      .compileComponents();  // compile template and css
  }));

  // synchronous beforeEach
  beforeEach((done) => {
    jasmine.MAX_PRETTY_PRINT_DEPTH = 10;
    jasmine.clock().install();

    fixture = TestBed.createComponent(SettingsGeneralComponent);

    comp = fixture.componentInstance; // SettingsGeneralComponent test instance

    clientMock.response = {};
    clientMock.response['api/v1/settings/'] = {
      status: 'success',
      channel: {
        guid: '1000',
        name: '',
        email: 'test@minds.com',
        mature: 0,
        disabled_emails: 0,
        selectedCategories: ['art', 'comedy'],
        open_sessions: 1,
      },
      thirdpartynetworks: []
    };

    window.Minds.user = {
      "guid": "1000",
      "type": "user",
      "signup_method": false,
    };

    window.Minds.categories = {
      art: 'Art',
      animals: 'Animals'
    };


    fixture.detectChanges();

    if (fixture.isStable()) {
      done();
    } else {
      fixture.whenStable()
        .then(() => done());
    }
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should have an action bar', () => {
    expect(fixture.debugElement.query(By.css('.m-settings--action'))).not.toBeNull();
  });

  it('should have a save button in the action bar', () => {
    const saveButton = getSaveButton();
    expect(saveButton).not.toBeNull();
    expect(saveButton.nativeElement.textContent).toContain('Save');
    expect(saveButton.nativeElement.hidden).toBeFalsy();
  });

  it('should have a saved button in the action bar when settings have already been saved', () => {
    comp.saved = true;
    fixture.detectChanges();

    const saveButton = getSaveButton();
    expect(saveButton.nativeElement.hidden).toBeTruthy();

    const savedButton = getSavedButton();
    expect(savedButton).not.toBeNull();
    expect(savedButton.nativeElement.textContent).toContain('Saved');
    expect(savedButton.nativeElement.hidden).toBeFalsy();
  });

  it('should display an error (if any) in the action bar', () => {
    comp.error = 'error';
    fixture.detectChanges();

    const error = fixture.debugElement.query(By.css('.m-settings--action > .minds-error'));

    expect(error).not.toBeNull();
    expect(error.nativeElement.textContent).toContain(comp.error);
  });

  it('should display a progress bar in the action bar', () => {
    const spinner = fixture.debugElement.query(By.css('.m-settings--action > .mdl-progress'));
    expect(spinner).not.toBeNull();

    expect(spinner.nativeElement.hidden).toBeTruthy();

    comp.inProgress = true;
    fixture.detectChanges();

    expect(spinner.nativeElement.hidden).toBeFalsy();
  });

  it('should have a display name section', () => {
    expect(fixture.debugElement.query(By.css('.m-settings--name'))).not.toBeNull();

    const h4 = fixture.debugElement.query(By.css('.m-settings--name > h4'));
    expect(h4).not.toBeNull();
    expect(h4.nativeElement.textContent).toContain('Display Name');

    const input = fixture.debugElement.query(By.css('.m-settings--name input'));
    expect(input).not.toBeNull();
  });

  it('should change the display name when the input changes', () => {
    spyOn(comp, 'change').and.callThrough();

    const input = fixture.debugElement.query(By.css('.m-settings--name input'));

    input.nativeElement.value = 'test';
    input.nativeElement.dispatchEvent(new Event('input'));
    input.nativeElement.dispatchEvent(new Event('keyup'));
    fixture.detectChanges();

    expect(comp.name).toBe('test');
    expect(comp.change).toHaveBeenCalled();
    expect(comp.changed).toBeTruthy();
    expect(comp.saved).toBeFalsy();
  });

  it('should have a password section', () => {
    expect(fixture.debugElement.query(By.css('.m-settings--password'))).not.toBeNull();

    const h4 = fixture.debugElement.query(By.css('.m-settings--password > h4'));
    expect(h4).not.toBeNull();
    expect(h4.nativeElement.textContent).toContain('Account Password');

    const currentPassword = fixture.debugElement.query(By.css('.m-settings--password input#password'));
    expect(currentPassword).not.toBeNull();

    const currentPasswordLabel = fixture.debugElement.query(By.css('.m-settings--password label[for=password]'));
    expect(currentPasswordLabel).not.toBeNull();
    expect(currentPasswordLabel.nativeElement.textContent).toContain('Current password');

    const newPassword = fixture.debugElement.query(By.css('.m-settings--password input#password1'));
    expect(newPassword).not.toBeNull();

    const newPasswordLabel = fixture.debugElement.query(By.css('.m-settings--password label[for=password1]'));
    expect(newPasswordLabel).not.toBeNull();
    expect(newPasswordLabel.nativeElement.textContent).toContain('Your new password');

    const repeatPassword = fixture.debugElement.query(By.css('.m-settings--password input#password2'));
    expect(repeatPassword).not.toBeNull();

    const repeatPasswordLabel = fixture.debugElement.query(By.css('.m-settings--password label[for=password2]'));
    expect(repeatPasswordLabel).not.toBeNull();
    expect(repeatPasswordLabel.nativeElement.textContent).toContain('Your new password again');
  });

  it('should change the password when the input changes', fakeAsync(() => {
    spyOn(comp, 'change').and.callThrough();

    const currentPassword = fixture.debugElement.query(By.css('.m-settings--password input#password'));
    const newPassword = fixture.debugElement.query(By.css('.m-settings--password input#password1'));
    const repeatPassword = fixture.debugElement.query(By.css('.m-settings--password input#password2'));

    expect(newPassword.nativeElement.disabled).toBeTruthy();
    expect(repeatPassword.nativeElement.disabled).toBeTruthy();

    currentPassword.nativeElement.value = 'test';
    currentPassword.nativeElement.dispatchEvent(new Event('input'));
    currentPassword.nativeElement.dispatchEvent(new Event('keyup'));
    fixture.detectChanges();
    tick();

    expect(comp.password).toBe('test');
    expect(newPassword.nativeElement.disabled).toBeFalsy();
    expect(repeatPassword.nativeElement.disabled).toBeFalsy();

    newPassword.nativeElement.value = 'test2';
    newPassword.nativeElement.dispatchEvent(new Event('input'));
    newPassword.nativeElement.dispatchEvent(new Event('keyup'));
    fixture.detectChanges();

    expect(comp.password1).toBe('test2');
    expect(comp.canSubmit()).toBeFalsy(); // passwords do not yet match

    repeatPassword.nativeElement.value = 'test2';
    repeatPassword.nativeElement.dispatchEvent(new Event('input'));
    repeatPassword.nativeElement.dispatchEvent(new Event('keyup'));
    fixture.detectChanges();

    expect(comp.password2).toBe('test2');
    expect(comp.change).toHaveBeenCalledTimes(3);
    expect(comp.canSubmit()).toBeTruthy();
  }));

  it('should have a mature content section', () => {
    expect(fixture.debugElement.query(By.css('.m-settings--mature'))).not.toBeNull();

    const h4 = fixture.debugElement.query(By.css('.m-settings--mature > h4'));
    expect(h4).not.toBeNull();
    expect(h4.nativeElement.textContent).toContain('Mature Content');

    const input = fixture.debugElement.query(By.css('.m-settings--mature input'));
    expect(input).not.toBeNull();

    const label = fixture.debugElement.query(By.css('.m-settings--mature label'));
    expect(label).not.toBeNull();
    expect(label.nativeElement.textContent).toContain('Always show mature content (18+)');
  });

  it('should change the mature  property when the input changes', () => {
    spyOn(comp, 'change').and.callThrough();
    const input = fixture.debugElement.query(By.css('.m-settings--mature input'));
    expect(input).not.toBeNull();

    expect(input.nativeElement.checked).toBeFalsy();

    input.nativeElement.click();
    fixture.detectChanges();

    expect(comp.mature).toBeTruthy();
    expect(comp.change).toHaveBeenCalled();
  });

  it('should have a Facebook section', () => {
    expect(fixture.debugElement.query(By.css('.m-settings--facebook'))).not.toBeNull();

    const h4 = fixture.debugElement.query(By.css('.m-settings--facebook > h4'));
    expect(h4).not.toBeNull();
    expect(h4.nativeElement.textContent).toContain('Facebook');

    const button = fixture.debugElement.query(By.css('.m-settings--facebook button'));
    expect(button).not.toBeNull();
    expect(button.nativeElement.textContent).toContain('Connect with Facebook');
  });

  it('should connect with facebook', () => {
    const button = fixture.debugElement.query(By.css('.m-settings--facebook button'));
    button.nativeElement.click();
    fixture.detectChanges();
    expect(thirdPartyNetworksServiceMock.connect).toHaveBeenCalled();
  });
  it('should disconnect from facebook if already connected', () => {
    thirdPartyNetworksServiceMock.connected = true;
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('.m-settings--facebook button'));
    expect(button).not.toBeNull();
    expect(button.nativeElement.textContent).toContain('Disconnect from Facebook');

    button.nativeElement.click();
    fixture.detectChanges();
    expect(thirdPartyNetworksServiceMock.disconnect).toHaveBeenCalled();
  });

  it('should revoke facebook login', () => {
    window.Minds.user.signup_method = 'facebook';
    thirdPartyNetworksServiceMock.connected = true;
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('.m-settings--facebook button'));
    expect(button).not.toBeNull();
    expect(button.nativeElement.textContent).toContain('Revoke Facebook Login');

    button.nativeElement.click();
    fixture.detectChanges();
    expect(thirdPartyNetworksServiceMock.removeFbLogin).toHaveBeenCalled();
  });

  it('should have a Twitter section', () => {
    thirdPartyNetworksServiceMock.connected = false;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.m-settings--twitter'))).not.toBeNull();

    const h4 = fixture.debugElement.query(By.css('.m-settings--twitter > h4'));
    expect(h4).not.toBeNull();
    expect(h4.nativeElement.textContent).toContain('Twitter');

    const button = fixture.debugElement.query(By.css('.m-settings--twitter button'));
    expect(button).not.toBeNull();
    expect(button.nativeElement.textContent).toContain('Connect with Twitter');
  });

  it('should connect with twitter', () => {
    thirdPartyNetworksServiceMock.connected = false;
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('.m-settings--twitter button'));
    button.nativeElement.click();
    fixture.detectChanges();
    expect(thirdPartyNetworksServiceMock.connect).toHaveBeenCalled();
  });

  it('should disconnect from twitter', () => {
    thirdPartyNetworksServiceMock.connected = true;
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('.m-settings--twitter button'));
    expect(button.nativeElement.textContent).toContain('Disconnect from Twitter');
    button.nativeElement.click();
    fixture.detectChanges();
    expect(thirdPartyNetworksServiceMock.disconnect).toHaveBeenCalled();
  });

  it('should have a categories section', () => {
    expect(fixture.debugElement.query(By.css('.m-settings--categories'))).not.toBeNull();

    const h4 = fixture.debugElement.query(By.css('.m-settings--categories > h4'));
    expect(h4).not.toBeNull();
    expect(h4.nativeElement.textContent).toContain('Categories');

    const ul = fixture.debugElement.query(By.css('.m-settings--categories ul'));
    expect(ul).not.toBeNull();
    expect(ul.nativeElement.children.length).toBe(2);
  });

  it('should select a category when clicking it', () => {
    spyOn(comp, 'onCategoryClick').and.callThrough();
    const li = fixture.debugElement.query(By.css('.m-settings--categories li:first-child'));
    expect(li).not.toBeNull();
    li.nativeElement.click();
    fixture.detectChanges();
    expect(comp.onCategoryClick).toHaveBeenCalled();

    expect(comp.categories[0].selected).toBeTruthy();
  });

  it('should have a sessions section', () => {
    expect(fixture.debugElement.query(By.css('.m-settings--close-all-sessions'))).not.toBeNull();

    const h4 = fixture.debugElement.query(By.css('.m-settings--close-all-sessions > h4'));
    expect(h4).not.toBeNull();
    expect(h4.nativeElement.textContent).toContain('Sessions');

    const p = fixture.debugElement.query(By.css('.m-settings--close-all-sessions > p'));
    expect(p).not.toBeNull();
    expect(p.nativeElement.textContent).toContain('You currently have 1 opened session');

    const button = fixture.debugElement.query(By.css('.m-settings--close-all-sessions button'));
    expect(button).not.toBeNull();
    expect(button.nativeElement.textContent).toContain('Close All Sessions');
  });

  it('should close all sessions', () => {
    spyOn(comp, 'closeAllSessions').and.callThrough();
    const button = fixture.debugElement.query(By.css('.m-settings--close-all-sessions button'));
    button.nativeElement.click();
    expect(comp.closeAllSessions).toHaveBeenCalled();

    expect(routerMock.navigate).toHaveBeenCalled();
    expect(routerMock.navigate.calls.mostRecent().args[0]).toEqual(['/logout/all']);
  });

});
