import { Container, Inject, Service } from "typedi";

import { Dispatch, Store } from "redux";

import { QueryVersionStatus } from '@assess/content/dto';
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

	constructor() {		
		this.appArea = document.getElementById("app-area");
	}

	public startup(inCordova: boolean | null): void {
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
