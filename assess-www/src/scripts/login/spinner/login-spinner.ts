import { BaseOverlay } from '@assess/overlay/base-overlay';
import spinnerTemplate from './login-spinner.html';
import './login-spinner.scss';

export class LoginSpinnerOverlay extends BaseOverlay {
  constructor() {
    super('login-spinner-ctr');
  }

  protected addOverlayContent(content: HTMLElement): void {
    content.innerHTML = spinnerTemplate;
  }
}
