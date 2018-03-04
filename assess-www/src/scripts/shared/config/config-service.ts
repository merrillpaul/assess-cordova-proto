import { Service } from 'typedi';

import { IConfig } from '@assess/config-type';

import ENVS from '../../../config'

@Service()
export class ConfigService {

    public getConfig(): IConfig {
        const env = process.env.NODE_ENV || 'localdev';
        return ENVS[env];
    }

}