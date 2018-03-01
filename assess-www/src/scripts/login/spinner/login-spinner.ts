import { BaseOverlay } from '@assess/overlay/base-overlay';
import { El } from '@assess/shared/component/element';
import spinnerTemplate from './login-spinner.html';
import './login-spinner.scss';

import { Service } from 'typedi';


@Service()
export class LoginSpinnerOverlay extends BaseOverlay {

  @El('.message')
  private message: HTMLDivElement;

  constructor() {
    super('login-spinner-ctr');
  }

  public updateMessage(message: string): void {
    this.message.innerHTML = message;
  }

  protected addOverlayContent(content: HTMLElement): void {
    content.innerHTML = spinnerTemplate;
  }
  
}
