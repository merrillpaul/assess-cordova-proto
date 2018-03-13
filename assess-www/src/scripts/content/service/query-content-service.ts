import { IContentQueryState, NewContentVersion, QueryVersionStatus } from '@assess/content/dto';
import { ConfigService } from '@assess/shared/config/config-service';
import { HttpService } from '@assess/shared/http/http-service';
import { Logger } from '@assess/shared/log/logger-annotation';
import {  LoggingService } from '@assess/shared/log/logging-service';
import { Inject, Service } from 'typedi';
import * as interfaceManifest from '../../../public/data/interface-manifest.json';

import * as qs from 'qs';

/** 
 * Most of the logic from QueryContentVersion.m 
 */
@Service()
export class QueryContentService {

    @Inject()
    private httpService: HttpService;

    @Inject()
    private configService: ConfigService;

    @Logger()
    private logger: LoggingService;

    public queryVersion(query: string): Promise<IContentQueryState> {
        const url = '/content/queryVersion';
        return new Promise<IContentQueryState>((res, rej) => {
            

            this.logger.info(`Querying version with ${query}`);

            this.configService.getConfig().then (config => {
                const bodyFormData: any = {};
                bodyFormData.branch = config.branch;
                bodyFormData.config = config.config;
                bodyFormData.interfaceManifest = JSON.stringify(interfaceManifest);
                bodyFormData.query = query;
                return bodyFormData;
            }).then(bodyFormData =>
                this.httpService.post(url, qs.stringify(bodyFormData))
                .then(response => {
                const downloadables: NewContentVersion[] = [];
                for (let i = 0, len = response.data.length; i < len; i++ ) {
                    const item = response.data[i];
                    const status = item.status;
                    if ("must upgrade" === status) {
                        rej(QueryVersionStatus.UPDATE_NEEDED);
                        return;
                    } else if ("found" === status) {
                        
                        if (item.url) {
                            downloadables.push ({
                                displayName: item.displayName,
                                hash: item.hash,
                                path: item.path,      
                                size: parseInt(item.size, 10),
                                url: item.url,
                                versionWithType: item.filetype                                                           
                            });
                        } else {
                            rej(QueryVersionStatus.INVALID_URL);
                            return;
                        }
                    } else if ("not found" === status) {
                        // The server didn't know about a content type that we have. This shouldn't happen, but it can
			            // e.g if the app was first built and run for one configuration and then built and run for another
                        // that doens't support all the same content types.
                        // IGNORED, may just need a log
                    } else if ("unchanged" !== status) {
                        // unknown state
                        rej(QueryVersionStatus.FAILED);
                        return;
                    }
                }
                const result: IContentQueryState = { 
                    contentQueryStatus: downloadables.length > 0 ? QueryVersionStatus.SUCCESS_WITH_NEW_VERSIONS : QueryVersionStatus.SUCCESS_WITH_NO_NEW_VERSION, 
                    downloadsNeeded: downloadables
                };
                res(result);
            }))
            .catch(error => rej(QueryVersionStatus.FAILED));
        });
       
    }
}