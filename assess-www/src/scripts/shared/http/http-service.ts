
import { AxiosInstance, AxiosRequestConfig, default as axios } from 'axios';
import { Inject,Service } from 'typedi';

import { ConfigService } from '@assess/shared/config/config-service';

const HEADERS:any = {
    'X-Requested-With': 'Assess',
};

@Service()
export class HttpService {

    
    @Inject()
    private configService: ConfigService;
    
    public request<T = any>(config: AxiosRequestConfig, external: boolean = false): Promise<T> {
        return this.resolveConf(external).then(delegate => delegate.request(config) as Promise<any>);
    }
    public get<T = any>(url: string, config?: AxiosRequestConfig, external: boolean = false): Promise<T> {
        return this.resolveConf(external).then(delegate => delegate.get(url, config) as Promise<any>);
    }
    public delete(url: string, config?: AxiosRequestConfig, external: boolean = false): Promise<void> {
        return this.resolveConf(external).then(delegate => delegate.delete(url, config) as Promise<any>);
    }
    public head(url: string, config?: AxiosRequestConfig, external: boolean = false): Promise<void> {
        return this.resolveConf(external).then(delegate => delegate.head(url, config) as Promise<any>);
    }
    public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig, external: boolean = false, ): Promise<T> {
        return this.resolveConf(external).then(delegate => delegate.post(url, data, config) as Promise<any>);
    }
    public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig, external: boolean = false, ): Promise<T> {
        return this.resolveConf(external).then(delegate => delegate.put(url, data, config) as Promise<any>);
    }
    public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig, external: boolean = false, ): Promise<T> {
        return this.resolveConf(external).then(delegate => delegate.patch(url, data, config) as Promise<any>);
    }

    private resolveConf(external: boolean): Promise<AxiosInstance> {
        if (!external) {
            return this.configService.getConfig().then(conf => {
                const baseURL = conf.centralEndpoint + conf.centralContext;
                return  axios.create({
                    baseURL,
                    headers: HEADERS,
                    withCredentials: true                    
                  });
            });            
        } else {
            return Promise.resolve(this.getRequest());
        }
    }

    private getRequest(): AxiosInstance {
        return axios.create({headers: HEADERS, withCredentials: true});
    }
}
