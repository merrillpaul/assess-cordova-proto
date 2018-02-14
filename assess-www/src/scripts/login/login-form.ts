import template from './login-form.html';
import './login-form.scss';

import { FileService } from '../services/file-service';
import { LoginSpinnerOverlay } from './spinner/login-spinner';

export class LoginForm {
  private ctr: HTMLElement;
  private usernameFld: HTMLInputElement;
  private passwordFld: HTMLInputElement;
  private loginButton: HTMLButtonElement;
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
        setTimeout(() => spinnerOverlay.dispose(), 4000);
        this.fileService
          .recursiveMkDir('/sub1/sub22/sub33')
          .then(subDir => {
            this.fileService
              .writeFile(
                subDir,
                'index1.html',
                new Blob(
                  [
                    `
            <h1> Hello to Inner html ${Date.now()}</h1>
            <div style="color:red;font-weight:bold: font-size:3em;"> Lorem Ipsum </div>
            `,
                  ],
                  { type: 'text/html' }
                )
              )
              .then(file => {
                alert('file created');
                alert(file.fullPath);
                alert(file.toInternalURL());
                alert(file.toURL());
                console.log(
                  'file created',
                  file.fullPath,
                  file.toURL(),
                  file.nativeURL
                );
                window.location.href = file.toInternalURL();
              })
              .catch(e => {
                alert('in er' + e);
              });
          })
          .catch(e => {
            alert(e);
          });
      });
    }

    if (window.cordova) {
      // console.log(` Cordova ${cordova.version}`);
    } else {
      // console.log("Boo no cordova");
    }
  }

  public dispose(): void {
    this.ctr.remove();
  }
}
