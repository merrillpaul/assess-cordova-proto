import template from "./mfa-form.html";
import "./mfa-form.scss";

import { AppContext } from "@assess/app-context";
import { LoginStateProvider } from '@assess/login/reducers/state-provider';
import { BaseComponent, ComponentTemplate, IComponentModel } from '@assess/shared/component/base-component';
import { El } from '@assess/shared/component/element';
import constants from '../constants';

import { Inject, Service } from "typedi";

@Service()
@ComponentTemplate(template)
export class MfaForm extends BaseComponent {

	@El('#method')
	private methodFld: HTMLSelectElement;
	
	@El('#code')
	private codeFld: HTMLInputElement;
	
	@El('#login-button')
    private loginButton: HTMLButtonElement;
    
    @El('#send-button')
	private sendButton: HTMLButtonElement;
	
	@El('td.error-message-area')
	private errorArea: HTMLTableCellElement;
	
	@El('#mfaForm')
	private form: HTMLFormElement;
    
    @Inject()
    private loginProvider: LoginStateProvider;

	
	protected prepareComponent(rootContainer: HTMLDivElement): IComponentModel<any> {
		rootContainer.setAttribute("class", "mfa-ctr");
		return {
			data: this.loginProvider.getUserInfo().mfaDetails
		};	
	}

	protected initEvents(rootContainer: HTMLDivElement) {
		const change = () => {
			if ( this.methodFld.value === 'mfa.type.google.authenticator') {
				this.sendButton.classList.add('hidden');
				this.codeFld.disabled = false;
			} else {
				this.sendButton.classList.remove('hidden');
				this.codeFld.disabled = true;
			}
		};
		change();
		this.methodFld.addEventListener('change', () => change());

		this.sendButton.addEventListener('click', () => {
			this.dispatchAction({
				mfaType: this.methodFld.value,
				type: constants.REQUEST_OTP,
			});
		});
	}
}
