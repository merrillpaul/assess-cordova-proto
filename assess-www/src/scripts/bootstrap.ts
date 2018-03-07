import * as Handlebars from 'handlebars';
import { Dispatch, Store } from "redux";
import { Container, Inject, Service } from "typedi";

import { QueryVersionStatus } from '@assess/content/dto';
import { I18n } from '@assess/i18n/i18n';
import { ConfigService } from '@assess/shared/config/config-service';
import { Logger, LoggingService } from '@assess/shared/log/logging-service';
import { BootstrapStateProvider } from "@assess/shared/state/bootstrap-state-provider";
import { STARTUP_ACTIONS } from "./app-constants";
import { AppContext } from "./app-context";
import { LoginForm } from "./login/login-form";

@Service()
export class Bootstrapper {
	private appArea: HTMLElement;

	@Inject() private loginForm: LoginForm;

	@Inject() private stateProvider: BootstrapStateProvider;

	@Inject()
	private appContext: AppContext;

	@Logger()
	private logger: LoggingService;

	@Inject()
	private configService: ConfigService;

	@Inject()
	private i18n: I18n;

	constructor() {		
		this.appArea = document.getElementById("app-area");
	}

	public startup(inCordova: boolean | null): void {

		// setting up our i18n function into templates
		Handlebars.registerHelper('i18n', (options: any) => {
			const key = options.hash.key;
			const data = {};
			Object.keys(options.hash).forEach(k => {
				if ( k !== 'key') {
					data[k] = options.hash[k];
				}
			});
			return new Handlebars.SafeString(this.i18n.getMessage(key, data));
		});

		this.appArea.innerHTML = "";
		if ( inCordova ) {
			Container.get(AppContext).setInCordova();
		}
		this.initEvents();
		this.logger.success(`App starting up with ${JSON.stringify(this.configService.getConfig())}`);
		this.appContext.getStore().dispatch({ type: STARTUP_ACTIONS.BOOTSTRAP });
	}	

	private initEvents() {
		this.stateProvider.onTargetPage().subscribe(change => {
			switch (change.newVal) {
				case STARTUP_ACTIONS.BOOTSTRAP:
					this.appArea.innerHTML = "";
					break;
				case STARTUP_ACTIONS.SHOW_LOGIN:
					this.addComponent(this.loginForm.createContainer());
					break;
				default:
					break;
			}
		});
	}

	private addComponent(component: HTMLElement): void {
		this.appArea.innerHTML = "";
		this.appArea.appendChild(component);
	}
}
