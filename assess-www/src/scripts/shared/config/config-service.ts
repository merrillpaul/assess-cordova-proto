import { AppContext } from '@assess/app-context';
import { IConfig } from '@assess/config-type';
import { AppPreferences } from '@assess/shared/config/app-preferences';

import ENVS from '../../../config'

import { Inject, Service } from 'typedi';

@Service()
export class ConfigService {

    @Inject()
    private appContext: AppContext;

    @Inject()
    private appPrefs: AppPreferences;

    public getConfig(): Promise<IConfig> {
        if (!this.appContext.withinCordova) {
            const env = process.env.NODE_ENV || 'localdev';
            return Promise.resolve(ENVS[env]);
        } else {
            return this.appPrefs.getHost().then(host => ENVS[host.toLowerCase()]);
        }
    }

}