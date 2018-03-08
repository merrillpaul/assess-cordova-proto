import { I18n } from '@assess/i18n/i18n';
import { BaseOverlay } from '@assess/overlay/base-overlay';
import { ComponentTemplate, IComponentModel } from '@assess/shared/component/base-component';
import { El } from '@assess/shared/component/element';

import alertTemplate from './dialog-alert.html';
import './dialog.scss';

import { Inject, Service } from 'typedi';

@Service()
@ComponentTemplate(alertTemplate)
export class Dialog extends BaseOverlay {
  

  @Inject()
  private i18n: I18n;

  @El('input.ok')
  private okButton: HTMLButtonElement;

  @El('.title')
  private title: HTMLDivElement;

  @El('.dialog-content')
  private contentDisplay: HTMLDivElement;

  private message:string;

  private content: string;
  
  private promise: Promise<string>;

  constructor() {
    super('dialog-ctr');
  }

  public alert(message: string, content: string = '') : Promise<string> {
      this.message = message;
      this.content = content;
      super.show();
      
      this.promise = new Promise((res, rej) => {
        this.okButton.addEventListener('click', ()=> {
            this.dispose();
            res('ok');            
        });
      });
      return this.promise;
  } 

  protected prepareOverlayContent(content: HTMLElement): IComponentModel<any> {
    return {
        data: {
            content: this.content,
            message: this.message
        }
    };
  }
}
