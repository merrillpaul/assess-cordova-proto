import template from './login-form.html';
import './login-form.scss';

import { ContentProgressState } from '../dto/content-download-status';
import { ContentTarService } from '../services/content-tar-service';
import { LoginSpinnerOverlay } from './spinner/login-spinner';

import { FileService } from '../services/file-service';

export class LoginForm {
  private ctr: HTMLElement;
  private usernameFld: HTMLInputElement;
  private passwordFld: HTMLInputElement;
  private loginButton: HTMLButtonElement;
  private contentTarService = new ContentTarService();
  private fileService = new FileService();

  public render(root: HTMLElement | null): void {
    if (root) {
      this.ctr = document.createElement('div');
      this.ctr.setAttribute('class', 'login-ctr');
      this.ctr.innerHTML = template;
      root.appendChild(this.ctr);
      this.loginButton = this.ctr.querySelector(
        '#login-button'
      ) as HTMLButtonElement;
      this.usernameFld = this.ctr.querySelector(
        '.login-name-input-area input[name="j_username"]'
      ) as HTMLInputElement;
      this.passwordFld = this.ctr.querySelector(
        '.password-input-area input[name="j_password"]'
      ) as HTMLInputElement;

      let spinnerOverlay: LoginSpinnerOverlay;
      this.loginButton.addEventListener('click', () => {
        spinnerOverlay = new LoginSpinnerOverlay();
        spinnerOverlay.show();

        
       this.contentTarService
          .downloadAndExtract(
            //'https://s3.amazonaws.com/qi-qa-tars/lite.tar'
            //'https://s3.amazonaws.com/qi-qa-tars/js.tar'
            'https://s3.amazonaws.com/qi-qa-tars/non-stim-all-tar-corrected.tar'
            )
          .subscribe(
            status => {
              console.log('new status', JSON.stringify(status, null, 5));
              if (status.progress === ContentProgressState.EXTRACTED) {
                console.log('@@@ Done extracting tar');
              }
            },
            error => {
              console.log('error', JSON.stringify(error, null, 5));
              spinnerOverlay.dispose();
            },
            () => {
              spinnerOverlay.dispose();
              console.log('@@FInAL DONE');
              this.contentTarService.getContentRoot().subscribe(contentDir => {
                 console.log('content root', contentDir.fullPath, contentDir.toURL(), contentDir.nativeURL,  contentDir.toInternalURL ? contentDir.toInternalURL(): '');
                 window.location.href = contentDir.nativeURL + 'give-www/homeUI_en.html';
              });
            }
          );
          
          /*this.contentTarService.getContentRoot().subscribe(contentDir => {
            spinnerOverlay.dispose();
            console.log('content root', contentDir.fullPath, contentDir.toURL(), contentDir.nativeURL,  contentDir.toInternalURL ? contentDir.toInternalURL(): '');
            window.location.href = contentDir.nativeURL + 'give-www/homeUI_en.html';
         });*/
         //this.contentTarService.testAjax();
         
      });
     
  }
  }

  public dispose(): void {
    this.ctr.remove();
  }
}
