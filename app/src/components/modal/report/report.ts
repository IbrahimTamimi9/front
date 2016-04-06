import { Component, EventEmitter } from 'angular2/core';
import { CORE_DIRECTIVES } from 'angular2/common';
import { ROUTER_DIRECTIVES, Router } from 'angular2/router';

import { Modal } from '../modal';
import { Client } from '../../../services/api';

@Component({
  selector: 'm-modal-report',
  inputs: [ 'open', '_object: object' ],
  outputs: ['closed'],
  directives: [ CORE_DIRECTIVES, ROUTER_DIRECTIVES, Modal ],
  template: `
    <m-modal [open]="open" (closed)="close($event)" class="mdl-color-text--blue-grey-700">

      <div [hidden]="sent" class="m-modal-report-body">
        <p class="m-modal-report-question">
          What's going on?
        </p>

        <div *ngFor="#item of subjects">
          <input type="radio"
          [disabled]="inProgress"
          [ngModel]="{ checked: subject == item.value }"
          (ngModelChange)="subject = item.value"
          name="subject"
          value="{{ item.value }}"
          />
          <label>{{ item.label }}</label>
        </div>

        <div class="m-modal-report-buttons">
          <button class="mdl-button mdl-button--raised" [disabled]="inProgress" (click)="send()">
            Send
          </button>
        </div>
      </div>

      <div [hidden]="!sent" class="m-modal-report-body">
        <p>
          Thanks for letting us know! We appreciate
          your effort to keep Minds safe and secure.
        </p>

        <p>
          We will review your report as soon as possible.
        </p>

        <div class="m-modal-report-buttons">
          <button class="mdl-button mdl-button--raised" (click)="close()">
            Dismiss
          </button>
        </div>
      </div>

    </m-modal>
  `
})

export class ReportModal {

  open : boolean = false;
  closed : EventEmitter<any> = new EventEmitter();
  object : any = {};

  inProgress: boolean = false;
  sent: boolean = false;
  subject: string = '';

  subjects: any[] = [
    { value: 'spam', label: 'It\'s spam' },
    { value: 'sensitive', label: 'It displays a sensitive image' },
    { value: 'abusive', label: 'It\'s abusive or harmful' },
    { value: 'annoying', label: 'It shouldn\'t be on Minds' }
  ];

  constructor(public client: Client) {
  }

  set _object(object: any){
    this.object = object;
  }

  close(){
    this.open = false;
    this.closed.next(true);
  }

  send(){
    this.inProgress = true;

    let subject = this.subject;

    if (!subject || !this.object.guid) {
      return;
    }

    this.client.post(`api/v1/entities/report/${this.object.guid}`, { subject })
    .then((response: any) => {
      this.inProgress = false;

      if (response.done) {
        this.sent = true;
      } else {
        this.close();
        alert('There was an error sending your report.');
      }
    })
    .catch(e => {
      this.inProgress = false;
      this.close();
      alert(e.message ? e.message : e);
    });
  }

}
