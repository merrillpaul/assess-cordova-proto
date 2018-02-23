import template from "./login-form.html";
import "./login-form.scss";
import { startLogin } from "./actions";

import { ContentProgressState } from "../dto/content-download-status";
import { ContentTarService } from "../services/content-tar-service";
import { LoginSpinnerOverlay } from "./spinner/login-spinner";

import { FileService } from "../services/file-service";

import { Inject, Service } from "typedi";
import { AppContext } from "../app-context";
import { LoginStateProvider } from "./reducers/state-provider";

@Service()
export class LoginForm {
	private ctr: HTMLElement;
	private usernameFld: HTMLInputElement;
	private passwordFld: HTMLInputElement;
	private loginButton: HTMLButtonElement;

	@Inject() private contentTarService: ContentTarService;

	@Inject() private fileService: FileService;

	@Inject() private appContext: AppContext;

	@Inject() private provider: LoginStateProvider;

	public createComponent(): HTMLElement {
		this.ctr = document.createElement("div");
		this.ctr.setAttribute("class", "login-ctr");
		this.ctr.innerHTML = template;
		this.loginButton = this.ctr.querySelector(
			"#login-button"
		) as HTMLButtonElement;
		this.usernameFld = this.ctr.querySelector(
			'.login-name-input-area input[name="j_username"]'
		) as HTMLInputElement;
		this.passwordFld = this.ctr.querySelector(
			'.password-input-area input[name="j_password"]'
		) as HTMLInputElement;

		let spinnerOverlay: LoginSpinnerOverlay;
		this.appContext.getStore().subscribe(() => {
			const loginState = this.provider.getState();
			if (loginState.isLoggingIn) {
				spinnerOverlay = new LoginSpinnerOverlay();
				spinnerOverlay.show();
			}
		});

		this.loginButton.addEventListener("click", () => {
			this.appContext.dispatchAction(
				startLogin(this.usernameFld.value, this.passwordFld.value)
			);
			//spinnerOverlay = new LoginSpinnerOverlay();
			//spinnerOverlay.show();

			/*this.contentTarService
          .downloadAndExtract(
            //'https://s3.amazonaws.com/qi-qa-tars/lite.tar'
            //'https://s3.amazonaws.com/qi-qa-tars/js.tar'
            // the correction here is to a hacked isDesktopBrowser call for the moment
            // cause if its false, then all those Assess 'phonegap' plugins will kick in.
            // We wuld need to update all those bridge code to avoid this hack
            'https://s3.amazonaws.com/qi-qa-tars/non-stim-all-corrected.tar'
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
                 window.location.href = contentDir.toInternalURL() + 'give-www/homeUI_en.html';
              });
            }
          ); */

			//this.contentTarService.testAjax();
    });
    return this.ctr;
	}

	public dispose(): void {
		this.ctr.remove();
	}
}
