import { IConfig } from '../scripts/config-type';
import { BaseConfig } from './base-config';
const CONFIG: IConfig = {...BaseConfig,
  centralEndpoint: 'https://ppe.qiactive.com/'
};

export default CONFIG;
