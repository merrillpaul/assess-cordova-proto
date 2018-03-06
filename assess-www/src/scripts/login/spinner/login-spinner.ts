import { BaseOverlay } from '@assess/overlay/base-overlay';
import { ComponentTemplate, IComponentModel } from '@assess/shared/component/base-component';
import { El } from '@assess/shared/component/element';
import spinnerTemplate from './login-spinner.html';
import './login-spinner.scss';

import { Service } from 'typedi';

@Service()
@ComponentTemplate(spinnerTemplate)
export class LoginSpinnerOverlay extends BaseOverlay {

  @El('.message')
  private message: HTMLDivElement;

  constructor() {
    super('login-spinner-ctr');
  }

  public updateMessage(message: string): void {
    this.message.innerHTML = message;
  }

  protected prepareOverlayContent(content: HTMLElement): IComponentModel<any> {
    return {
      data: {}
    };
  }
  
}
