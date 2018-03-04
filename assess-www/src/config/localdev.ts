import { IConfig } from '../scripts/config-type';
import { BaseConfig } from './base-config';

const CONFIG: IConfig = { ...BaseConfig,
  centralEndpoint: 'http://#LOCAL_IP#:8080'  
};

export default CONFIG;
