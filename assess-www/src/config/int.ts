import { IConfig } from '../scripts/config-type';
import { BaseConfig } from './base-config';

const CONFIG: IConfig = {...BaseConfig,
  centralEndpoint: 'https://int.qiactive.com'
};
export default CONFIG; 
