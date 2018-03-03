import { Config } from '../scripts/config-type';
import { BaseConfig } from './base-config';

const CONFIG: Config = { ...BaseConfig,
  centralContext: '/choose-share',
  centralEndpoint: 'http://#LOCAL_IP#:8080'  
};

export default CONFIG;
