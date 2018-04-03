import template from "./login-form.html";
import "./login-form.scss";

import { AppContext } from "@assess/app-context";
import { QueryVersionStatus } from '@assess/content/dto';
import { BaseComponent, ComponentTemplate, IComponentModel } from '@assess/shared/component/base-component';
import { El } from '@assess/shared/component/element';
import { FileService } from "@assess/shared/file/file-service";
import { LoginStateProvider } from "./reducers/state-provider";
import { LoginSpinnerOverlay } from "./spinner/login-spinner";

import { Inject, Service } from "typedi";

import { startLogin } from "./actions";

@Service()
@ComponentTemplate(template)
export class LoginForm extends BaseComponent {

	@El('.login-name-input-area input[name="j_username"]')
	private usernameFld: HTMLInputElement;
	
	@El('.password-input-area input[name="j_password"]')
	private passwordFld: HTMLInputElement;
	
	@El('#login-button')
	private loginButton: HTMLButtonElement;
	
	@El('td.error-message-area')
	private errorArea: HTMLTableCellElement;

	@Inject() private fileService: FileService;

	@Inject() private provider: LoginStateProvider;

	@Inject()
	private loginSpinner: LoginSpinnerOverlay;

	protected prepareComponent(rootContainer: HTMLDivElement): IComponentModel<any> {
		rootContainer.setAttribute("class", "login-ctr");
		return {
			data: {}
		};	
	}

	protected initEvents(rootContainer: HTMLDivElement) {

		this.loginButton.addEventListener("click", () => {
			this.dispatchAction(
				startLogin(this.usernameFld.value, this.passwordFld.value)
			);
		});

		this.provider.onFetching().subscribe (change => {
			if (change.newVal) {
				this.errorArea.innerHTML = "";
			}
		});

		this.provider.onFetching().subscribe((change) => {			
			if (change.newVal) {
				this.loginSpinner.show();
			} 
		});

		this.provider.onLoginErrors().subscribe(change => {
			const errors = change.newVal;
			if(errors && errors.length > 0) {
				this.errorArea.innerHTML = `
					<ul>
						${errors.map (error => {
							return `<li class="errors">${error}</li>`;
						}).join('')}
					</ul>
				`;
			}
		});

		this.provider.onChange('loginForm', 'usernameInError').subscribe(change => {
			const parentElement = this.usernameFld.parentElement;
			if (change.newVal) {
				parentElement.classList.add('error')
			} else {
				parentElement.classList.remove('error');
			}			
		});

		this.provider.onChange('loginForm', 'passwordInError').subscribe(change => {
			const parentElement = this.passwordFld.parentElement;
			if (change.newVal) {
				parentElement.classList.add('error');
			} else {
				parentElement.classList.remove('error');
			}			
		});
	}
}
