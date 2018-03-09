import template from "./mfa-form.html";
import "./mfa-form.scss";

import { AppContext } from "@assess/app-context";
import { I18n } from '@assess/i18n/i18n';
import { LoginStateProvider } from '@assess/login/reducers/state-provider';
import { IMfaState } from '@assess/mfa/dto';
import { MfaStateProvider } from '@assess/mfa/reducers/mfa-state-provider';
import { BaseComponent, ComponentTemplate, IComponentModel } from '@assess/shared/component/base-component';
import { El } from '@assess/shared/component/element';
import { IStoreObservable } from '@assess/shared/state/base-state-provider';
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

	@El('.trigger-result')
	private triggerResultArea: HTMLDivElement;
	
	@El('#mfaForm')
	private form: HTMLFormElement;
    
    @Inject()
	private loginProvider: LoginStateProvider;
	
	@Inject()
	private provider: MfaStateProvider;	

	@Inject()
	private i18n: I18n;

	
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

		this.loginButton.addEventListener('click', () => {
			this.dispatchAction({
				mfaCode: this.codeFld.value,
				mfaType: this.methodFld.value,
				type: constants.REQUEST_MFA
			});
		});

		this.provider.onOtpRequest().subscribe((changed: IStoreObservable) => {
			const mfaState: IMfaState = this.provider.getMfaState();
			if (changed.newVal) {
				this.errorArea.innerHTML = '';
				this.triggerResultArea.innerHTML = '';
				this.triggerResultArea.classList.remove('errors');
				this.codeFld.disabled = true;
				this.loginButton.disabled = true;
				this.sendButton.querySelector('.btn-text').classList.add('hidden');
				this.sendButton.querySelector('.loading').classList.remove('hidden');
			} else {
				this.loginButton.disabled = false;
				this.sendButton.querySelector('.btn-text').classList.remove('hidden');
				this.sendButton.querySelector('.loading').classList.add('hidden');
			}

			if (mfaState.triggerOtpSuccess) {
				this.codeFld.disabled = false;
				this.triggerResultArea.innerHTML = mfaState.triggerOtpMessage.replace('#1', 
					this.provider.getCommunicatorAddress(mfaState.currentMfaType));
				this.triggerResultArea.classList.remove('errors');
			} else {
				this.triggerResultArea.classList.add('errors');
				this.triggerResultArea.innerHTML = mfaState.triggerOtpMessage;
			}
		});


		this.provider.onLoginRequest().subscribe((changed: IStoreObservable) => {
			if (changed.newVal) {
				this.errorArea.innerHTML = '';								      
			} 
			const mfaState: IMfaState = this.provider.getMfaState();
			this.errorArea.innerHTML = mfaState.errors.join("");
		});
	}
}
