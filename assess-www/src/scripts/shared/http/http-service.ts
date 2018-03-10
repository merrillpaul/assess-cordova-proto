
import { AxiosInstance, default as axios } from 'axios';
import { Inject,Service } from 'typedi';

import { ConfigService } from '@assess/shared/config/config-service';

const HEADERS:any = {
    'X-Requested-With': 'Assess',
};

@Service()
export class HttpService {
    private centralRequest: AxiosInstance;

    
    constructor(@Inject(type => ConfigService) configService: ConfigService) {
        this.centralRequest = axios.create({
          baseURL: configService.getConfig().centralEndpoint + configService.getConfig().centralContext,
          headers: HEADERS,
          withCredentials: true
        });
    }

    public getCentralRequest(): AxiosInstance {
        return this.centralRequest
    }

    public getRequest(): AxiosInstance {
        return axios.create({headers: HEADERS, withCredentials: true});
    }
}
